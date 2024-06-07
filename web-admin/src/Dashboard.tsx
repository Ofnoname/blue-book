import {useEffect, useState} from "react";
import {getArticles, approveArticle, deleteArticle} from "./api/api.ts";
import {Article, ArticleStatus} from "./api/api.type.ts";
import {message, Table, Button, Popconfirm, Input, Collapse, Select} from "antd";
import {MinusCircleTwoTone, PlusCircleTwoTone, UserOutlined} from "@ant-design/icons";
const { Option } = Select;

// 定义可选的文章状态
const articleStatuses = [
    { label: '所有', value: 'all' },
    { label: '待审核', value: 'pending' },
    { label: '已批准', value: 'approved' },
    { label: '已拒绝', value: 'rejected' },
];

import './Dashboard.css';

import {useNavigate} from 'react-router-dom';

const {Panel} = Collapse;



function Dashboard() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [role, setRole] = useState<'reviewer' | 'admin'>('admin');
    const [current, setCurrent] = useState(1); // 当前页码
    const [pageSize, setPageSize] = useState(10); // 每页显示的文章数
    const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | 'all'>('all'); // 当前选中的状态
    const [keyword, setKeyword] = useState(''); // 搜索关键词
    const [total, setTotal] = useState(0); // 文章总数
    const navigate = useNavigate();

    const approve = (id: number, status: 'approved' | 'rejected') => () => {
        let rejectReason = undefined;
        console.log(status);

        if (status === 'rejected') {
            rejectReason = prompt('请输入拒绝原因:');
            if (rejectReason === null) { // 如果用户取消输入，则不继续执行
                return;
            }
        }

        approveArticle(id, status, rejectReason).then(res => {
            if (res.ok) { // 确认response.ok而不是res.status === 200
                message.success('操作成功！');
                refreshArticles();
            } else {
                message.error('操作失败！');
            }
        });
    };

    const refreshArticles = () => {
        const passedStatus = selectedStatus === 'all' ? undefined : selectedStatus;
        getArticles({page: current, pageSize, status: passedStatus, keyword}).then(result => {
            setArticles(result.articles as Article[]);
            setTotal(result.total);
        }).catch(error => {
            console.error('获取文章失败:', error);
            message.error('无法加载文章数据。');
        });
    }

    const handleStatusChange = (selectedStatus: ArticleStatus | 'all') => {
        setCurrent(1); // 重置页码为1
        setSelectedStatus(selectedStatus);
        // refreshArticles();
    };



    function logout() {
        localStorage.removeItem('jwtoken');
        navigate('/login');
    }

    const delete_ = (id: number) => () => {
        deleteArticle(id).then(res => {
            if (res.status === 200) {
                message.success('删除成功！');
                refreshArticles();
            } else {
                message.error('删除失败！');
            }
        });

    }

    useEffect(() => {
        document.title = '仪表盘 - 小蓝书管理平台';
        const jwt = localStorage.getItem('jwtoken');
        if (!jwt) {
            message.error('请先登录！');
            localStorage.removeItem('jwtoken');
            navigate('/login');
            return; // 提前退出，避免继续执行异步操作
        }

        // 从 localStorage 中获取头像，权限等信息
        setRole(localStorage.getItem('role') as 'reviewer' | 'admin');

        refreshArticles();
    }, [current, pageSize]);

    useEffect(() => {
        refreshArticles();
    }, [keyword, selectedStatus]);


    return (
        <>
            <header className="header">
                <Input.Search placeholder="搜索文章" style={{width: 200}} onSearch={value => setKeyword(value)}/>
                <span className="tag">
                    <UserOutlined/>
                    {role === 'admin' ? '管理员' : '审核员'}
                </span>
                <Popconfirm title={"确定要登出吗？"} onConfirm={logout}>
                    <Button type="primary">退出登录</Button>
                </Popconfirm>
            </header>

            <main className="content main-content">
                <Select
                    defaultValue="all"
                    style={{ width: 120, marginRight: 8, marginBottom: 16}}
                    onChange={handleStatusChange}
                >
                    {articleStatuses.map(status => (
                        <Option key={status.value} value={status.value}>{status.label}</Option>
                    ))}
                </Select>

                <Table
                    dataSource={articles}
                    rowKey="id"
                    expandable={{
                        expandedRowRender: record => (
                            <>
                                <p>{record.content}</p>

                                {record.image_urls.length > 0 && (
                                    <Collapse>
                                        { record.image_urls.length > 0 &&
                                            (<Panel header="图片预览" key="1">

                                                <div className="image-list">
                                                {record.image_urls.map((url, index) => (
                                                    <img width={200} style={{marginRight: '.5rem'}} key={index}
                                                         src={url} alt={`图片${index}`}/>
                                                ))}
                                            </div>
                                        </Panel>)}
                                    </Collapse>
                                )}
                            </>

                        ),

                        expandIcon: ({expanded, onExpand, record}) =>
                            expanded ? (
                                <MinusCircleTwoTone onClick={e => onExpand(record, e)}/>
                            ) : (
                                <PlusCircleTwoTone onClick={e => onExpand(record, e)}/>
                            )
                    }}
                    pagination={{
                        current,
                        pageSize,
                        total,
                        onChange: (page, pageSize) => {
                            setCurrent(page);
                            setPageSize(pageSize);
                        }
                    }}
                    columns={[
                        {title: 'ID', dataIndex: 'id'},
                        {title: '标题', dataIndex: 'title'},
                        {
                            title: '拒绝原因',
                            dataIndex: 'rejected_reason',
                            key: 'rejected_reason',
                            render: (text) => text || '—', // 如果有拒绝原因就展示，否则展示一个占位符
                        },

                        // 为状态添加颜色
                        {
                            title: '状态', dataIndex: 'status', render: (status: string) => {
                                let color = 'blue';
                                if (status === 'approved') color = 'green';
                                if (status === 'rejected') color = 'red';
                                return <span style={{color, fontWeight: "bold"}}>{status}</span>;
                            }
                        },
                        {
                            title: '操作', render: (record: Article) => (
                                <div style={{display: 'flex', gap: '.5rem'}}>
                                    {record.status === 'pending' && (
                                        <>
                                            <Button type="primary"
                                                    onClick={approve(record.id, 'approved')}>通过</Button>
                                            <Button type="primary" danger
                                                    onClick={approve(record.id, 'rejected')}>拒绝</Button>
                                        </>
                                    )}
                                    {role === 'admin' &&
                                        (<Popconfirm title="确定要删除这篇文章吗？" onConfirm={delete_(record.id)}>
                                            <Button type="primary" danger>删除</Button>
                                        </Popconfirm>)}
                                </div>
                            )
                        }
                    ]}
                />
            </main>
        </>
    );
}

export default Dashboard;

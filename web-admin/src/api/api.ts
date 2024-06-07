// api.ts
import type {ArticleStatus, LoginResponse} from './api.type.ts';
import {message} from "antd";

// 从 localStorage 中获取 token
const getToken = () => {
    return localStorage.getItem('jwtoken') || '';
}

const login = async (username: string, password: string): Promise<LoginResponse> => {
    return await fetch(base+'/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
    }).then(res => res.json());
};

const getArticles = async ({
    page,
    pageSize,
    status,
    keyword
}:{
    page?: number,
    pageSize?: number,
    status?: ArticleStatus,
    keyword?: string
} = {
}) => {
    // Start building the URL with the base endpoint
    let url = new URL(base+'/api/article/all');

    // Append parameters if they are provided
    if (page !== undefined) url.searchParams.append('page', page.toString());
    if (pageSize !== undefined) url.searchParams.append('pageSize', pageSize.toString());
    if (status !== undefined) url.searchParams.append('status', status);
    if (keyword !== undefined) url.searchParams.append('keyword', keyword);

    // Make the fetch request using the constructed URL
    return await fetch(url.toString(), {
        headers: {
            'Authorization': getToken()
        }
    }).then((res) => {
        // Check if the response is OK (status 200)
        if (res.ok) {
            // Parse and return the 'articles' from the JSON response
            return res.json();
        }
        // If the status code is 401 or 403, indicate that a redirect is needed
        localStorage.removeItem('jwtoken');
        message.error('请先登录！');
        window.location.href = '/login';
    });
};


const approveArticle = async (articleId: number, status: ArticleStatus, rejectReason?: string) => {
    return await fetch(base+`/api/article/${articleId}/approve`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
        },
        body: JSON.stringify({status, rejectReason})
    })
};

const deleteArticle = async (articleId: number) => {
    return await fetch(base+`/api/article/${articleId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': getToken()
        }
    })
}

export { login, getArticles, approveArticle, deleteArticle };

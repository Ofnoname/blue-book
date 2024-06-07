type User = {
    username: string;
    password: string;
    type: UserRoles;
};

type RspInfo = {
    code?: number;
    message?: string;
}

type ArticleStatus = 'pending' | 'approved' | 'rejected';
type UserRoles = 'admin' | 'reviewer' | 'normal';

type Article = {
    id: number;
    title: string;
    content: string;
    status: ArticleStatus;
    image_urls: string[];
    rejectReason?: string;
};

type LoginResponse =       {
    auth: boolean
    token: string
    avatar_url: string
    role: UserRoles
    id: string
} & RspInfo

export type { User, Article, LoginResponse, ArticleStatus };

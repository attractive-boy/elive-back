import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { page = 1, pageSize = 10 } = req.query;

        // 获取总数
        const total = await db('lives')
            .count('* as count')
            .first();

        // 获取分页数据
        const list = await db('lives')
            .select('*')
            .orderBy('created_at', 'desc')
            .limit(Number(pageSize))
            .offset((Number(page) - 1) * Number(pageSize));

        return res.status(200).json({
            success: true,
            data: {
                data: list,
                total: total?.count || 0,
                page: Number(page),
                pageSize: Number(pageSize)
            }
        });

    } catch (error) {
        console.error('获取直播列表失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取直播列表失败'
        });
    }
}

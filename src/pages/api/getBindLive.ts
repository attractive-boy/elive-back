import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { openid } = req.body;

        const user_id = await db('users').where({ openid }).first('id');

        if (!user_id) {
            return res.status(404).json({
                success: false,
                message: '用户未找到'
            });
        }
        console.log('user_id:', user_id);

        const queryBuilder = db('lives')
            .leftJoin('live_auth_codes', 'lives.id', 'live_auth_codes.live_id')
            .where({ 'live_auth_codes.user_id': user_id.id })
            .select('*')
            .orderBy('live_auth_codes.created_at', 'desc');

        // 输出生成的 SQL 语句
        console.log('Generated SQL:', queryBuilder.toSQL().sql);

        const list = await queryBuilder;

        return res.status(200).json({
            success: true,
            data: list
        });

    } catch (error) {
        console.error('获取直播列表失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取直播列表失败'
        });
    }
}


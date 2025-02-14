import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '方法不允许' });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '请提供直播ID'
            });
        }

        // 获取直播信息
        const live = await db('live_auth_codes').where({ id }).first();

        if (!live) {
            return res.status(404).json({
                success: false,
                message: '直播不存在'
            });
        }

        // 删除数据库记录
        await db('live_auth_codes').where({ id }).delete();

        return res.status(200).json({
            success: true,
            message: '删除成功'
        });

    } catch (error) {
        console.error('删除直播失败:', error);
        return res.status(500).json({
            success: false,
            message: '删除直播失败'
        });
    }
}
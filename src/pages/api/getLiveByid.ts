import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id } = req.body;

        

        const queryBuilder = db('lives')
            .where({ 'id': id })
            .select('*')

        // 输出生成的 SQL 语句
        console.log('Generated SQL:', queryBuilder.toSQL().sql);

        const list = await queryBuilder;

        return res.status(200).json({
            success: true,
            data: list
        });

    } catch (error) {
        console.error('获取直播失败:', error);
        return res.status(500).json({
            success: false,
            message: '获取直播失败'
        });
    }
}


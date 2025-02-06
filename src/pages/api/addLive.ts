import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '方法不允许' });
    }

    try {
        const { video_url, title, start_date } = req.body;
        if (!video_url || !title || !start_date) {
            return res.status(400).json({
                success: false,
                message: '请提供完整信息'
            });
        }

        try {

            // 保存到数据库
            const [id] = await db('lives').insert({
                title,
                video_url,
                start_date,
                created_at: new Date()
            });

            console.log('数据插入成功，ID:', id);


            return res.status(200).json({
                success: true,
                data: {
                    id
                }
            });
        }
        catch (error) {
            console.error('插入数据失败:', error);
            return res.status(500).json({
                success: false,
                message: '插入数据失败'
            });
        }
    }
    catch (error) {
        console.error('处理失败:', error);
        return res.status(500).json({
            success: false,
            message: '处理失败'
        });
    }
}
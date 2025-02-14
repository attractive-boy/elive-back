import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 如果需要严格区分请求方法，可改用 PUT 或 PATCH，此处保持和 add 接口一致使用 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { id, video_url, title, start_date } = req.body;
    if (!id || !video_url || !title || !start_date) {
      return res.status(400).json({
        success: false,
        message: '请提供完整信息'
      });
    }

    try {
      // 更新数据库记录，假设 lives 表中有 updated_at 字段
      const affectedRows = await db('lives')
        .where({ id })
        .update({
          title,
          video_url,
          start_date,
          updated_at: new Date() // 更新操作的时间戳
        });

      console.log('更新成功，受影响的行数:', affectedRows);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: '记录未找到'
        });
      }

      return res.status(200).json({
        success: true,
        data: { id }
      });
    } catch (error) {
      console.error('更新数据失败:', error);
      return res.status(500).json({
        success: false,
        message: '更新数据失败'
      });
    }
  } catch (error) {
    console.error('处理失败:', error);
    return res.status(500).json({
      success: false,
      message: '处理失败'
    });
  }
}

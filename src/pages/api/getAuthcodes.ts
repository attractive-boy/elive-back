import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 本接口使用 GET 方法
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    // 从请求查询参数中获取 live_id、current 和 pageSize 参数
    // 注意：req.query 中的值均为字符串或字符串数组
    const { live_id, current = '1', pageSize = '10' } = req.query;

    if (!live_id) {
      return res.status(400).json({
        success: false,
        message: '缺少参数 live_id'
      });
    }

    // 将分页参数转换为数字
    const page = parseInt(current as string, 10);
    const limit = parseInt(pageSize as string, 10);
    const offset = (page - 1) * limit;

    // 查询符合条件的授权码总数
    const countResult = await db('live_auth_codes')
      .where({ live_id: Number(live_id) })
      .count({ total: '*' });
    // 注意：不同的数据库驱动返回的计数结果可能类型不一，故转换为 Number
    const total = Number(countResult[0].total);

    // 根据 live_id 分页查询授权码记录，按创建时间降序排列
    const authcodes = await db('live_auth_codes')
      .where({ live_id: Number(live_id) })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return res.status(200).json({
      success: true,
      data: authcodes,
      total
    });
  } catch (error) {
    console.error('获取授权码失败:', error);
    return res.status(500).json({
      success: false,
      message: '获取授权码失败'
    });
  }
}

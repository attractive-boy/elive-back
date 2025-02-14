import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';

/**
 * 生成随机授权码
 * @param length 长度，默认8位
 */
function generateAuthCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 仅允许 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { live_id } = req.body;
    if (!live_id) {
      return res.status(400).json({
        success: false,
        message: '缺少参数 live_id'
      });
    }

    // 尝试生成唯一的授权码（最多尝试 5 次）
    let authcode = generateAuthCode();
    let exists = await db('live_auth_codes').where({ authcode }).first();
    let attempts = 0;
    while (exists && attempts < 5) {
      authcode = generateAuthCode();
      exists = await db('live_auth_codes').where({ authcode }).first();
      attempts++;
    }

    if (exists) {
      return res.status(500).json({
        success: false,
        message: '生成唯一授权码失败，请重试'
      });
    }

    // 插入新的授权码记录
    const [id] = await db('live_auth_codes').insert({
      live_id: live_id,
      authcode: authcode,
      status: 'unused', // 默认状态为未使用
      created_at: new Date()
    });

    return res.status(200).json({
      success: true,
      data: {
        id,
        authcode
      }
    });
  } catch (error) {
    console.error('添加授权码失败:', error);
    return res.status(500).json({
      success: false,
      message: '添加授权码失败'
    });
  }
}

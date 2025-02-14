import type { NextApiRequest, NextApiResponse } from 'next';
import db from '@/services/db';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 仅允许 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { openid, auth_code } = req.body;
    const userid = await db('users').where({ openid }).first('id');
    await db('live_auth_codes').where({ authcode: auth_code }).update({
      user_id: userid.id,
      status: 'used',
      used_at: new Date()
    });
    return res.status(200).json({
      success: true,
      message: '授权成功'
    });
    
  } catch (error) {
    console.error('处理失败:', error);
    return res.status(500).json({
      success: false,
      message: '处理失败'
    });
  }
}

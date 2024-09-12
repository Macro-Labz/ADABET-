import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (req.method === 'GET') {
    try {
      const bets = await prisma.bet.findMany({
        where: {
          userAddress: address as string,
        },
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          amount: true,
          odds: true,
          result: true,
          profitLoss: true,
          createdAt: true,
        },
      });

      const formattedBets = bets.map((bet: {
        id: string;
        amount: number;
        odds: number;
        result: string;
        profitLoss: number;
        createdAt: Date;
      }) => ({
        id: bet.id,
        amount: bet.amount,
        odds: bet.odds,
        result: bet.result,
        profitLoss: bet.profitLoss,
        date: format(bet.createdAt, 'yyyy-MM-dd'),
      }));

      res.status(200).json(formattedBets);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching betting history data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
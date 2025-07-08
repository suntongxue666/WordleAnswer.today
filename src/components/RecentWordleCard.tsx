import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { calculatePuzzleNumber } from '@/lib/wordle-data';

interface RecentWordleCardProps {
  id: string;
  date: string; // YYYY-MM-DD
  puzzleNumber: number | null;
  answer: string;
  difficulty: string | null;
}

// 辅助组件：渲染最近答案卡片中的字母
const RenderWordleLetters = ({ word }: { word: string }) => {
  return (
    <div className="flex gap-1 justify-center mt-2">
      {word.split('').map((letter, index) => (
        <div
          key={`${word}-${index}`}
          className="w-10 h-10 border-2 border-green-500 rounded-md font-bold text-lg
                     flex items-center justify-center bg-green-500 text-white"
        >
          {letter.toUpperCase()} {/* 直接显示字母 */}
        </div>
      ))}
    </div>
  );
};

export function RecentWordleCard({ id, date, puzzleNumber, answer, difficulty }: RecentWordleCardProps) {
  const parsedDate = parseISO(date);
  const formattedDate = format(parsedDate, 'PPP'); // 例如：'July 6, 2025'
  
  // 计算期数，优先使用传入的puzzleNumber，否则自动计算
  const calculatedPuzzleNumber = puzzleNumber || calculatePuzzleNumber(date);

  // 获取难度颜色
  const getDifficultyColor = (diff: string | null) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-green-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'hard':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Puzzle #{calculatedPuzzleNumber}
          </CardTitle>
          {difficulty && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          )}
        </div>
        <CardDescription className="text-sm">
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between pt-0">
        <div className="flex flex-col items-center">
          <RenderWordleLetters word={answer} />
          <p className="mt-2 text-lg font-bold text-gray-800">{answer.toUpperCase()}</p>
        </div>
        <div className="mt-4">
          <Link href={`/wordle/${date}`} passHref>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 
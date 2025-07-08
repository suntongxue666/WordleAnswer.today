import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function completeReset() {
    console.log('🔥 完全重置数据库...');
    
    try {
        // 1. 删除所有数据
        const { error: deleteAllError } = await supabase
            .from('wordle-answers')
            .delete()
            .gte('date', '2020-01-01'); // 删除所有数据
            
        if (deleteAllError) {
            console.error('❌ 删除所有数据失败:', deleteAllError);
            return;
        }
        
        console.log('🗑️  已删除所有数据');
        
        // 2. 插入全新的清洁数据
        const cleanData = [
            {
                date: '2025-07-08',
                puzzle_number: 1480,
                answer: 'DREAD',
                hints: [
                    { type: 'clue', value: 'This word often describes a strong feeling of fear or apprehension.' },
                    { type: 'clue', value: 'It contains two vowels and three consonants.' },
                    { type: 'clue', value: 'The first letter is the fourth letter of the alphabet.' },
                    { type: 'clue', value: 'The word ends with a sound that is typically associated with the past tense in English.' },
                    { type: 'clue', value: 'It is commonly used in the phrase "_____ful anticipation."' },
                    { type: 'clue', value: 'The word functions as both a noun and a verb.' },
                    { type: 'clue', value: 'The letters "R" and "E" are found consecutively within this word.' },
                    { type: 'clue', value: 'Originating in the Old English language, this word is related to "drēogan," meaning to endure.' }
                ],
                difficulty: 'Medium',
                definition: 'A feeling of great fear or apprehension'
            },
            {
                date: '2025-07-07',
                puzzle_number: 1479,
                answer: 'STILT',
                hints: [
                    { type: 'clue', value: 'A long pole used to support structures above ground.' },
                    { type: 'clue', value: 'Birds of this name have extremely long legs.' },
                    { type: 'clue', value: 'Contains 5 letters and starts with S.' },
                    { type: 'clue', value: 'Often used in construction or as circus equipment.' }
                ],
                difficulty: 'Medium',
                definition: 'A long pole or post used as a support'
            },
            {
                date: '2025-07-06',
                puzzle_number: 1478,
                answer: 'ATRIA',
                hints: [
                    { type: 'clue', value: 'Plural form of a heart chamber.' },
                    { type: 'clue', value: 'Medical term for upper chambers of the heart.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with A.' },
                    { type: 'clue', value: 'Also refers to central courtyards in ancient Roman houses.' }
                ],
                difficulty: 'Hard',
                definition: 'Plural of atrium; upper chambers of the heart'
            },
            {
                date: '2025-07-05',
                puzzle_number: 1477,
                answer: 'BALER',
                hints: [
                    { type: 'clue', value: 'A machine used in farming to compress hay or straw.' },
                    { type: 'clue', value: 'Creates compact bundles for storage.' },
                    { type: 'clue', value: 'Essential equipment for hay production.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with B.' }
                ],
                difficulty: 'Medium',
                definition: 'A machine that compresses hay into bales'
            },
            {
                date: '2025-07-04',
                puzzle_number: 1476,
                answer: 'CURVE',
                hints: [
                    { type: 'clue', value: 'A smoothly bending line without sharp angles.' },
                    { type: 'clue', value: 'Roads often have these for safety.' },
                    { type: 'clue', value: 'In baseball, a type of pitch.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with C.' }
                ],
                difficulty: 'Easy',
                definition: 'A smoothly bending line'
            },
            {
                date: '2025-07-03',
                puzzle_number: 1475,
                answer: 'POPPY',
                hints: [
                    { type: 'clue', value: 'A bright red flower often seen in fields.' },
                    { type: 'clue', value: 'Symbol of remembrance for fallen soldiers.' },
                    { type: 'clue', value: 'Seeds are used in baking.' },
                    { type: 'clue', value: 'Contains 5 letters with double P.' }
                ],
                difficulty: 'Easy',
                definition: 'A bright red flower, symbol of remembrance'
            },
            {
                date: '2025-07-02',
                puzzle_number: 1474,
                answer: 'INCUR',
                hints: [
                    { type: 'clue', value: 'To bring something unpleasant upon oneself.' },
                    { type: 'clue', value: 'Often used with debt or costs.' },
                    { type: 'clue', value: 'Means to become subject to something.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with I.' }
                ],
                difficulty: 'Medium',
                definition: 'To become subject to something unpleasant'
            },
            {
                date: '2025-07-01',
                puzzle_number: 1473,
                answer: 'MOLDY',
                hints: [
                    { type: 'clue', value: 'Describes food that has gone bad with fuzzy growth.' },
                    { type: 'clue', value: 'Covered with fungus.' },
                    { type: 'clue', value: 'Often green or white in appearance.' },
                    { type: 'clue', value: 'Contains 5 letters, ends with Y.' }
                ],
                difficulty: 'Easy',
                definition: 'Covered with a fuzzy growth of mold'
            },
            {
                date: '2025-06-30',
                puzzle_number: 1472,
                answer: 'BLINK',
                hints: [
                    { type: 'clue', value: 'To shut and open the eyes quickly.' },
                    { type: 'clue', value: 'A very brief moment in time.' },
                    { type: 'clue', value: 'Lights often do this repeatedly.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with B.' }
                ],
                difficulty: 'Easy',
                definition: 'To shut and open the eyes quickly'
            },
            {
                date: '2025-06-29',
                puzzle_number: 1471,
                answer: 'WITTY',
                hints: [
                    { type: 'clue', value: 'Having a clever sense of humor.' },
                    { type: 'clue', value: 'Quick and amusing in speech.' },
                    { type: 'clue', value: 'Describes someone who makes clever jokes.' },
                    { type: 'clue', value: 'Contains 5 letters with double T.' }
                ],
                difficulty: 'Easy',
                definition: 'Having a clever sense of humor'
            },
            {
                date: '2025-06-28',
                puzzle_number: 1470,
                answer: 'STUMP',
                hints: [
                    { type: 'clue', value: 'The remaining part of a tree after cutting.' },
                    { type: 'clue', value: 'In cricket, the three wooden posts.' },
                    { type: 'clue', value: 'To puzzle or confuse someone.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with ST.' }
                ],
                difficulty: 'Easy',
                definition: 'The bottom part of a tree trunk left in the ground'
            },
            {
                date: '2025-06-27',
                puzzle_number: 1469,
                answer: 'PLAIN',
                hints: [
                    { type: 'clue', value: 'Simple and without decoration.' },
                    { type: 'clue', value: 'A large flat area of land.' },
                    { type: 'clue', value: 'Clear and easy to understand.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with P.' }
                ],
                difficulty: 'Easy',
                definition: 'Simple, undecorated, or a flat area of land'
            },
            {
                date: '2025-06-26',
                puzzle_number: 1468,
                answer: 'OFFER',
                hints: [
                    { type: 'clue', value: 'To present something for acceptance.' },
                    { type: 'clue', value: 'A proposal or bid.' },
                    { type: 'clue', value: 'To volunteer or provide.' },
                    { type: 'clue', value: 'Contains 5 letters with double F.' }
                ],
                difficulty: 'Easy',
                definition: 'To present something for someone to accept'
            },
            {
                date: '2025-06-25',
                puzzle_number: 1467,
                answer: 'COMFY',
                hints: [
                    { type: 'clue', value: 'Informal word for comfortable.' },
                    { type: 'clue', value: 'Cozy and relaxing.' },
                    { type: 'clue', value: 'Often describes furniture or clothes.' },
                    { type: 'clue', value: 'Contains 5 letters, ends with Y.' }
                ],
                difficulty: 'Easy',
                definition: 'Comfortable and cozy'
            },
            {
                date: '2025-06-24',
                puzzle_number: 1466,
                answer: 'ELITE',
                hints: [
                    { type: 'clue', value: 'The best or most skilled group.' },
                    { type: 'clue', value: 'A select group of people.' },
                    { type: 'clue', value: 'High-quality or superior.' },
                    { type: 'clue', value: 'Contains 5 letters, starts with E.' }
                ],
                difficulty: 'Easy',
                definition: 'A select group regarded as the best'
            }
        ];
        
        console.log(`📝 插入 ${cleanData.length} 条全新数据...`);
        
        const { data: insertedData, error: insertError } = await supabase
            .from('wordle-answers')
            .insert(cleanData)
            .select();
            
        if (insertError) {
            console.error('❌ 插入数据失败:', insertError);
            return;
        }
        
        console.log(`✅ 成功插入 ${insertedData.length} 条数据!`);
        
        // 3. 验证结果
        const { data: verifyData } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false })
            .limit(5);
            
        console.log('🎯 验证结果（最新5条）:');
        verifyData?.forEach(record => {
            console.log(`  ${record.date}: ${record.answer} - Puzzle #${record.puzzle_number}`);
        });
        
        console.log('🎉 数据库完全重置完成！');
        console.log('🌐 请访问: https://wordle-answer-today.vercel.app/');
        
    } catch (error) {
        console.error('❌ 重置过程出错:', error);
    }
}

completeReset().catch(console.error);
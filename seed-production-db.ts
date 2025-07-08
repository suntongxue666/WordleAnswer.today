import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yubvrpzgvixulyylqfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1YnZycHpndml4dWx5eWxxZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjQ5ODAsImV4cCI6MjA2NzM0MDk4MH0.yLB0DgETfVOiZLyZT3W_mVliR6lMOhpzXPzuX5ByKmM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndSeedDatabase() {
    console.log('🔍 检查生产环境数据库...');
    
    try {
        // 检查现有数据
        const { data: existingData, error: fetchError } = await supabase
            .from('wordle-answers')
            .select('date, answer, puzzle_number')
            .order('date', { ascending: false });
            
        if (fetchError) {
            console.error('❌ 获取数据失败:', fetchError);
            return;
        }
        
        console.log(`📊 当前数据库记录数: ${existingData.length}`);
        
        if (existingData.length > 0) {
            console.log('📅 现有数据:');
            existingData.forEach(record => {
                console.log(`  ${record.date}: ${record.answer} (Puzzle #${record.puzzle_number})`);
            });
            return;
        }
        
        console.log('📭 数据库为空，开始导入测试数据...');
        
        // 测试数据 - 15条记录
        const testData = [
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
                answer: 'GNOME',
                hints: [
                    { type: 'clue', value: 'This word refers to a small mythical creature.' },
                    { type: 'clue', value: 'It starts with a silent letter.' },
                    { type: 'clue', value: 'Often found in gardens as decorative statues.' },
                    { type: 'clue', value: 'Has 5 letters and 2 vowels.' }
                ],
                difficulty: 'Medium',
                definition: 'A small mythical creature, often depicted in gardens'
            },
            {
                date: '2025-07-06',
                puzzle_number: 1478,
                answer: 'FLASK',
                hints: [
                    { type: 'clue', value: 'A container for liquids, often made of glass or metal.' },
                    { type: 'clue', value: 'Commonly used in laboratories.' },
                    { type: 'clue', value: 'Has 5 letters, starts with F.' },
                    { type: 'clue', value: 'Can be used to store drinks while traveling.' }
                ],
                difficulty: 'Easy',
                definition: 'A narrow-necked container for liquids'
            },
            {
                date: '2025-07-05',
                puzzle_number: 1477,
                answer: 'BEACH',
                hints: [
                    { type: 'clue', value: 'A place where land meets water.' },
                    { type: 'clue', value: 'Popular vacation destination.' },
                    { type: 'clue', value: 'Often covered with sand.' },
                    { type: 'clue', value: 'Perfect for swimming and sunbathing.' }
                ],
                difficulty: 'Easy',
                definition: 'A sandy or pebbly shore by the sea'
            },
            {
                date: '2025-07-04',
                puzzle_number: 1476,
                answer: 'CRISP',
                hints: [
                    { type: 'clue', value: 'Describes something fresh and firm.' },
                    { type: 'clue', value: 'Often used to describe autumn air.' },
                    { type: 'clue', value: 'Can describe the texture of fresh vegetables.' },
                    { type: 'clue', value: 'Has 5 letters, contains two consonant clusters.' }
                ],
                difficulty: 'Medium',
                definition: 'Firm, dry, and brittle'
            },
            {
                date: '2025-07-03',
                puzzle_number: 1475,
                answer: 'PLANT',
                hints: [
                    { type: 'clue', value: 'A living organism that grows in soil.' },
                    { type: 'clue', value: 'Produces oxygen through photosynthesis.' },
                    { type: 'clue', value: 'Can be found in gardens and forests.' },
                    { type: 'clue', value: 'Often green in color.' }
                ],
                difficulty: 'Easy',
                definition: 'A living organism that grows in soil'
            },
            {
                date: '2025-07-02',
                puzzle_number: 1474,
                answer: 'BOARD',
                hints: [
                    { type: 'clue', value: 'A flat piece of wood or other material.' },
                    { type: 'clue', value: 'Used in construction and carpentry.' },
                    { type: 'clue', value: 'Can also mean to get on a vehicle.' },
                    { type: 'clue', value: 'Has 5 letters, contains two vowels.' }
                ],
                difficulty: 'Easy',
                definition: 'A flat piece of material or to get onto a vehicle'
            },
            {
                date: '2025-07-01',
                puzzle_number: 1473,
                answer: 'MAGIC',
                hints: [
                    { type: 'clue', value: 'The art of performing illusions.' },
                    { type: 'clue', value: 'Often involves tricks and sleight of hand.' },
                    { type: 'clue', value: 'Associated with wizards and magicians.' },
                    { type: 'clue', value: 'Has 5 letters, starts with M.' }
                ],
                difficulty: 'Easy',
                definition: 'The art of performing illusions and tricks'
            },
            {
                date: '2025-06-30',
                puzzle_number: 1472,
                answer: 'SHADE',
                hints: [
                    { type: 'clue', value: 'An area protected from direct sunlight.' },
                    { type: 'clue', value: 'Trees often provide this.' },
                    { type: 'clue', value: 'Can also refer to a color variation.' },
                    { type: 'clue', value: 'Has 5 letters, rhymes with "made".' }
                ],
                difficulty: 'Easy',
                definition: 'An area of comparative darkness'
            },
            {
                date: '2025-06-29',
                puzzle_number: 1471,
                answer: 'CLOUD',
                hints: [
                    { type: 'clue', value: 'A visible mass of water vapor in the sky.' },
                    { type: 'clue', value: 'Can bring rain or snow.' },
                    { type: 'clue', value: 'Often white or gray in color.' },
                    { type: 'clue', value: 'Has 5 letters, contains one vowel sound.' }
                ],
                difficulty: 'Easy',
                definition: 'A visible mass of water droplets in the atmosphere'
            },
            {
                date: '2025-06-28',
                puzzle_number: 1470,
                answer: 'GRAPE',
                hints: [
                    { type: 'clue', value: 'A small round fruit that grows in clusters.' },
                    { type: 'clue', value: 'Used to make wine.' },
                    { type: 'clue', value: 'Can be red, green, or purple.' },
                    { type: 'clue', value: 'Often eaten fresh or dried as raisins.' }
                ],
                difficulty: 'Easy',
                definition: 'A small round fruit that grows in clusters on vines'
            },
            {
                date: '2025-06-27',
                puzzle_number: 1469,
                answer: 'BRICK',
                hints: [
                    { type: 'clue', value: 'A rectangular building material.' },
                    { type: 'clue', value: 'Made from clay and baked in a kiln.' },
                    { type: 'clue', value: 'Commonly red or brown in color.' },
                    { type: 'clue', value: 'Used to build walls and houses.' }
                ],
                difficulty: 'Easy',
                definition: 'A rectangular block used in building'
            },
            {
                date: '2025-06-26',
                puzzle_number: 1468,
                answer: 'SWEET',
                hints: [
                    { type: 'clue', value: 'Having a taste like sugar or honey.' },
                    { type: 'clue', value: 'Opposite of bitter or sour.' },
                    { type: 'clue', value: 'Can describe desserts and candy.' },
                    { type: 'clue', value: 'Also used to describe something pleasant.' }
                ],
                difficulty: 'Easy',
                definition: 'Having a taste characteristic of sugar'
            },
            {
                date: '2025-06-25',
                puzzle_number: 1467,
                answer: 'STAMP',
                hints: [
                    { type: 'clue', value: 'Small adhesive piece of paper for mail.' },
                    { type: 'clue', value: 'Used to pay for postal services.' },
                    { type: 'clue', value: 'Often collected as a hobby.' },
                    { type: 'clue', value: 'Can also mean to press down firmly.' }
                ],
                difficulty: 'Easy',
                definition: 'A small adhesive piece of paper for posting mail'
            },
            {
                date: '2025-06-24',
                puzzle_number: 1466,
                answer: 'SMILE',
                hints: [
                    { type: 'clue', value: 'A facial expression showing happiness.' },
                    { type: 'clue', value: 'Involves curving the lips upward.' },
                    { type: 'clue', value: 'Often shows teeth.' },
                    { type: 'clue', value: 'Contagious expression of joy.' }
                ],
                difficulty: 'Easy',
                definition: 'A pleased or happy facial expression'
            }
        ];
        
        console.log(`📝 准备插入 ${testData.length} 条数据...`);
        
        // 批量插入数据
        const { data: insertedData, error: insertError } = await supabase
            .from('wordle-answers')
            .insert(testData)
            .select();
            
        if (insertError) {
            console.error('❌ 插入数据失败:', insertError);
            return;
        }
        
        console.log(`✅ 成功插入 ${insertedData.length} 条数据!`);
        console.log('🎉 数据库已准备就绪，网站应该可以正常显示内容了');
        
        // 验证插入结果
        const { data: verifyData } = await supabase
            .from('wordle-answers')
            .select('date, answer')
            .order('date', { ascending: false })
            .limit(5);
            
        console.log('📅 最新5条数据:');
        verifyData?.forEach(record => {
            console.log(`  ${record.date}: ${record.answer}`);
        });
        
    } catch (error) {
        console.error('❌ 操作失败:', error);
    }
}

checkAndSeedDatabase().catch(console.error);
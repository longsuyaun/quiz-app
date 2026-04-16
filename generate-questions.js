#!/usr/bin/env node
/**
 * 🦐 学习虾 - 错题题库生成器
 * 从 Markdown 错题文件自动生成 quiz-app 题库 JSON
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/apps/quiz-app/question-bank.json';

const DATA_SOURCES = {
    '左左': [
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/data/错题本/左左',
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/students/zuozuo/错题本'
    ],
    '右右': [
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/data/错题本/右右'
    ],
    'baoge': [
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/data/错题本/鲍哥'
    ]
};

const DIR_SUBJECT_MAP = {
    '物理': 'physics', '数学': 'math', '化学': 'chemistry',
    '生物': 'biology', '英语': 'english', '语文': 'chinese'
};

const SUBJECT_MAP = {
    '数学': 'math', '物理': 'physics', '化学': 'chemistry',
    '生物': 'biology', '英语': 'english', '语文': 'chinese'
};

function parseMarkdownFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const questions = [];
    
    // 尝试格式 1: ### 第 X 题
    const blocks = content.split(/(?=###\s+第\s*[0-9]+[ 题])/);
    for (const block of blocks) {
        if (!block.trim()) continue;
        const titleMatch = block.match(/###\s+第\s*([0-9]+)\s*题/);
        if (!titleMatch) continue;
        const q = parseQuestionBlock(block, parseInt(titleMatch[1]));
        if (q) questions.push(q);
    }
    
    // 尝试格式 2: ## 题目 X：或 ## ❌ 错题 X 或 ## ❌ 错题 X - 第 Y 题
    if (questions.length === 0) {
        const format2Blocks = content.split(/(?=##\s+(?:题目 |❌\s* 错题))/);
        for (const block of format2Blocks) {
            if (!block.trim()) continue;
            // 匹配：## 题目 1：或 ## ❌ 错题 1 或 ## ❌ 错题 1 - 第 6 题
            const titleMatch = block.match(/##\s+(?:题目 |❌\s* 错题)\s*([0-9]+|[一二三四五六七八九十]+)/);
            if (!titleMatch) continue;
            const q = parseFormat2Block(block, titleMatch[1]);
            if (q) questions.push(q);
        }
    }
    
    // 尝试格式 2.5: ## ❌ 错题 X - 第 Y 题（机械波单元检测格式）
    if (questions.length === 0) {
        const format25Blocks = content.split(/(?=##\s+❌\s* 错题\s*[0-9]+)/);
        for (const block of format25Blocks) {
            if (!block.trim()) continue;
            const titleMatch = block.match(/##\s+❌\s* 错题\s*([0-9]+)/);
            if (!titleMatch) continue;
            const q = parseFormat2Block(block, titleMatch[1]);
            if (q) questions.push(q);
        }
    }
    
    // 尝试格式 3: ## 题目 X：（光学专题格式）
    if (questions.length === 0) {
        const format3Blocks = content.split(/(?=##\s+题目\s*[0-9]+[：:])/);
        for (const block of format3Blocks) {
            if (!block.trim()) continue;
            const titleMatch = block.match(/##\s+题目\s*([0-9]+)[：:]/);
            if (!titleMatch) continue;
            const q = parseFormat3Block(block, titleMatch[1]);
            if (q) questions.push(q);
        }
    }
    
    // 尝试格式 4: ### 题 X/XXX：或 ### 题 X：（批量录入格式）
    if (questions.length === 0) {
        const format4Blocks = content.split(/(?=###\s+题\s+[0-9]+(?:\/[0-9]+)?：)/);
        for (const block of format4Blocks) {
            if (!block.trim()) continue;
            const titleMatch = block.match(/###\s+题\s*([0-9]+)(?:\/[0-9]+)?：/);
            if (!titleMatch) continue;
            const q = parseQuestionBlock(block, parseInt(titleMatch[1]));
            if (q) questions.push(q);
        }
    }
    
    // 尝试格式 3: 单题文件
    if (questions.length === 0) {
        const q = parseSingleQuestionFile(content, filePath);
        if (q) questions.push(q);
    }
    
    return questions;
}

function parseFormat3Block(block, idStr) {
    // 光学专题格式：## 题目 1：光的折射与折射率
    const id = parseInt(idStr) || 1;
    
    const q = { id, question: '', options: [], answer: '', analysis: '' };
    
    // 提取题目（### 📝 题目）
    const qSection = block.match(/###\s*[📝]*\s*题目\s*([\s\S]*?)(?=###|$)/);
    if (qSection) {
        q.question = qSection[1].trim();
    }
    
    // 光学专题通常是填空题，没有选项
    q.options = ['填空题'];
    q.isFill = true;
    
    // 提取答案（### ✅ 答案）
    const answerSection = block.match(/###\s*[✅]*\s* 答案\s*([\s\S]*?)(?=###|$)/);
    if (answerSection) {
        // 提取加粗的答案
        const answers = answerSection[1].match(/\*\*([^*]+)\*\*/g);
        if (answers) {
            q.answer = answers.map(a => a.replace(/\*\*/g, '')).join(',');
        }
    }
    
    // 提取解析（### 📖 详细解析）
    const analysisSection = block.match(/###\s*[📖]*\s* 详细解析\s*([\s\S]*?)(?=###|$)/);
    if (analysisSection) {
        q.analysis = analysisSection[1].trim().replace(/\n/g, '<br>');
    }
    
    if (q.question && q.answer) {
        return q;
    }
    return null;
}

function parseFormat2Block(block, idStr) {
    // 转换中文数字为阿拉伯数字
    const cnNums = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10 };
    const id = cnNums[idStr] || parseInt(idStr) || 1;
    
    const q = { id, question: '', options: [], answer: '', analysis: '' };
    
    // 提取题目（### 📝 题目 或 ### 题目）
    const qSection = block.match(/###\s*[📝]*\s*题目\s*([\s\S]*?)(?=###|$)/);
    if (qSection) {
        q.question = qSection[1].trim().replace(/^[:：]\s*/, '');
    }
    
    // 提取选项（支持 - A. 和 A. 两种格式）
    let optMatches = block.match(/^[A-D][,.]\s*([^\n]+)/gm);
    if (!optMatches) {
        optMatches = block.match(/-\s*[A-D][,.]\s*([^\n]+)/gm);
    }
    if (optMatches) {
        q.options = optMatches.map(o => o.replace(/^-\s*/, '').trim());
    }
    
    // 提取答案（### ✅ 答案 或 ### 正确答案 或 ### 你的答案/### 正确答案）
    const answerSection = block.match(/###\s*[✅]*\s* 答案\s*([\s\S]*?)(?=###|$)/);
    if (answerSection) {
        const ansMatch = answerSection[1].match(/\*\*([A-D]+|[0-9./]+)\*\*/);
        if (ansMatch) q.answer = ansMatch[1];
    }
    if (!q.answer) {
        const correctMatch = block.match(/###\s* 正确答案\s*[:：]?\s*\*\*([A-D]+|[0-9./]+)\*\*/);
        if (correctMatch) q.answer = correctMatch[1];
    }
    
    // 提取解析（### 📖 详细解析 或 ### 正确解析 或 ### 错误原因分析 + ### 正确解析）
    let analysisSection = block.match(/###\s*[📖]*\s*(?:详细 | 正确)? 解析\s*([\s\S]*?)(?=###|$)/);
    if (!analysisSection) {
        // 尝试组合错误原因分析 + 正确解析
        const errorAnalysis = block.match(/###\s* 错误原因分析\s*([\s\S]*?)(?=###|$)/);
        const correctAnalysis = block.match(/###\s* 正确解析\s*([\s\S]*?)(?=###|$)/);
        if (errorAnalysis || correctAnalysis) {
            let analysis = '';
            if (errorAnalysis) analysis += '**错误原因**:<br>' + errorAnalysis[1].trim().replace(/\n/g, '<br>');
            if (correctAnalysis) analysis += (analysis ? '<br><br>' : '') + '**正确解析**:<br>' + correctAnalysis[1].trim().replace(/\n/g, '<br>');
            if (analysis) analysisSection = [null, analysis];
        }
    }
    if (analysisSection && analysisSection[1]) {
        q.analysis = analysisSection[1].trim();
    }
    
    if (q.question && q.answer) {
        if (q.options.length === 0) { q.options = ['填空题']; q.isFill = true; }
        return q;
    }
    return null;
}

function parseQuestionBlock(block, id) {
    const q = { id, question: '', options: [], answer: '', analysis: '' };
    
    const qMatch = block.match(/\*\*题目\*\*:\s*([\s\S]*?)(?=\n\n|\*\*|$)/);
    if (qMatch) q.question = qMatch[1].trim();
    
    const optMatches = block.match(/^[A-D][,.]\s*([^\n]+)/gm);
    if (optMatches) q.options = optMatches.map(o => o.trim());
    
    const correctMatch = block.match(/\*\*正确答案\*\*:\s*\*?\*?([A-D]+|[0-9./]+)\*?\*?/);
    const yourMatch = block.match(/\*\*你的答案\*\*:\s*\*?\*?([A-D]+|[0-9./]+)\*?\*?/);
    if (correctMatch) q.answer = correctMatch[1];
    else if (yourMatch) q.answer = yourMatch[1];
    
    const analysisMatch = block.match(/\*\*解析\*\*:\s*([\s\S]*?)(?=\n\n\*\*|$)/);
    if (analysisMatch) q.analysis = analysisMatch[1].trim().replace(/\n/g, '<br>');
    
    if (q.question && q.answer) {
        if (q.options.length === 0) { q.options = ['填空题']; q.isFill = true; }
        return q;
    }
    return null;
}

function parseSingleQuestionFile(content, filePath) {
    const fileName = path.basename(filePath);
    const idMatch = fileName.match(/第\s*([0-9]+)\s*题/) || content.match(/第\s*([0-9]+)\s*题/);
    const id = idMatch ? parseInt(idMatch[1]) : 1;
    
    const q = { id, question: '', options: [], answer: '', analysis: '' };
    
    // 提取题目
    const qSection = content.match(/##\s*[📝]*\s*题目\s*([\s\S]*?)(?=##|$)/);
    if (qSection) {
        const qText = qSection[1].match(/\*\*第\s*[0-9]+\s*题 [^*]*\*\*([\s\S]*?)(?=A\.|B\.|C\.|D\.|$)/);
        if (qText) q.question = qText[1].trim();
        else {
            const directQ = qSection[1].match(/([\s\S]*?)(?=A\.|B\.|C\.|D\.|问题|$)/);
            if (directQ) q.question = directQ[1].trim();
        }
    }
    
    // 提取选项
    const optMatches = content.match(/^[A-D][,.]\s*([^\n]+)/gm);
    if (optMatches) q.options = optMatches.map(o => o.trim());
    
    // 提取答案
    const correctMatch = content.match(/✅\s*正确答案\s*[\n]*\*\*([A-D]+|[0-9./]+)\*\*/);
    const answerMatch = content.match(/###\s*✅\s*答案\s*[\n]*([\s\S]*?)(?:\n\n|\n###|$)/);
    if (correctMatch) q.answer = correctMatch[1];
    else if (answerMatch) {
        const ans = answerMatch[1].match(/\*\*([A-D]+|[0-9./]+)\*\*/);
        if (ans) q.answer = ans[1];
    }
    
    // 提取解析
    const analysisSection = content.match(/##\s*[📖]*\s*解析\s*([\s\S]*?)(?=##|$)/);
    if (analysisSection) q.analysis = analysisSection[1].trim().replace(/\n/g, '<br>');
    
    if (!q.question) {
        const fallbackQ = content.match(/###\s*[📝]*\s*题目\s*([\s\S]*?)(?=\n\n###|$)/);
        if (fallbackQ) q.question = fallbackQ[1].trim();
    }
    
    if (q.question && q.answer) {
        if (q.options.length === 0) { q.options = ['填空题']; q.isFill = true; }
        return q;
    }
    return null;
}

function scanMistakeBooks() {
    const questionBank = { '左左': {}, '右右': {} };
    
    for (const [userCode, sourceDirs] of Object.entries(DATA_SOURCES)) {
        const userName = userCode === '左左' ? '左左' : '右右';
        console.log(`\n📚 扫描 ${userName} 的错题本...`);
        
        for (const sourceDir of sourceDirs) {
            if (!fs.existsSync(sourceDir)) continue;
            console.log(`  📁 ${sourceDir}:`);
            
            const stat = fs.statSync(sourceDir);
            if (stat.isDirectory()) {
                const directFiles = fs.readdirSync(sourceDir)
                    .filter(f => f.endsWith('.md')).map(f => path.join(sourceDir, f));
                
                if (directFiles.length > 0) {
                    const dirName = path.basename(sourceDir);
                    const subjectCode = DIR_SUBJECT_MAP[dirName] || SUBJECT_MAP[dirName];
                    if (subjectCode) {
                        const subjectQuestions = [];
                        for (const file of directFiles) {
                            const questions = parseMarkdownFile(file);
                            if (questions.length > 0) {
                                console.log(`    - ${path.basename(file)}: ${questions.length} 题`);
                                subjectQuestions.push(...questions);
                            }
                        }
                        if (subjectQuestions.length > 0) {
                            if (!questionBank[userCode][subjectCode]) questionBank[userCode][subjectCode] = [];
                            questionBank[userCode][subjectCode].push(...subjectQuestions);
                            console.log(`    ✅ ${dirName}: ${subjectQuestions.length} 题`);
                        }
                    }
                }
                
                for (const subject of fs.readdirSync(sourceDir)) {
                    const subjectDir = path.join(sourceDir, subject);
                    let subjectCode = SUBJECT_MAP[subject] || DIR_SUBJECT_MAP[subject];
                    
                    if (!fs.statSync(subjectDir).isDirectory()) continue;
                    
                    // 如果目录名不是学科名，递归扫描子目录（如 2026-04-10/）
                    if (!subjectCode) {
                        console.log(`    📁 ${subject}/ (子目录):`);
                        
                        // 递归扫描所有子目录，自动识别学科
                        const autoScanDir = (dir, parentSubjectCode) => {
                            for (const item of fs.readdirSync(dir)) {
                                const itemPath = path.join(dir, item);
                                const itemStat = fs.statSync(itemPath);
                                if (itemStat.isDirectory()) {
                                    const itemSubjectCode = SUBJECT_MAP[item] || DIR_SUBJECT_MAP[item];
                                    if (itemSubjectCode) {
                                        // 找到学科目录，扫描其中的文件
                                        for (const subItem of fs.readdirSync(itemPath)) {
                                            const subItemPath = path.join(itemPath, subItem);
                                            const subItemStat = fs.statSync(subItemPath);
                                            if (subItemStat.isDirectory()) {
                                                autoScanDir(subItemPath, itemSubjectCode);
                                            } else if (subItem.endsWith('.md')) {
                                                const questions = parseMarkdownFile(subItemPath);
                                                if (questions.length > 0) {
                                                    console.log(`      - ${subItem}: ${questions.length} 题`);
                                                    if (!questionBank[userCode][itemSubjectCode]) questionBank[userCode][itemSubjectCode] = [];
                                                    questionBank[userCode][itemSubjectCode].push(...questions);
                                                }
                                            }
                                        }
                                    } else {
                                        // 不是学科目录，继续递归扫描
                                        autoScanDir(itemPath, parentSubjectCode);
                                    }
                                } else if (item.endsWith('.md')) {
                                    // 直接扫描 MD 文件
                                    const questions = parseMarkdownFile(itemPath);
                                    if (questions.length > 0) {
                                        console.log(`      - ${item}: ${questions.length} 题`);
                                        
                                        // 根据每个题目的 ID 自动识别学科
                                        for (const q of questions) {
                                            let targetSubject;
                                            if (q.id >= 300 && q.id <= 399) {
                                                targetSubject = 'chemistry';
                                            } else if (q.id >= 200 && q.id <= 299) {
                                                targetSubject = 'physics';
                                            } else if (q.id >= 400 && q.id <= 499) {
                                                targetSubject = 'biology';
                                            } else if (q.id >= 100 && q.id <= 199) {
                                                targetSubject = 'math';
                                            } else {
                                                targetSubject = parentSubjectCode || 'unknown';
                                            }
                                            
                                            if (!questionBank[userCode][targetSubject]) questionBank[userCode][targetSubject] = [];
                                            questionBank[userCode][targetSubject].push(q);
                                        }
                                    }
                                }
                            }
                        };
                        
                        autoScanDir(subjectDir, null);
                        continue;
                    }
                    
                    // 学科目录，扫描其中的文件
                    console.log(`    📖 ${subject}:`);
                    const subjectQuestions = [];
                    
                    const scanDir = (dir) => {
                        for (const item of fs.readdirSync(dir)) {
                            const itemPath = path.join(dir, item);
                            const itemStat = fs.statSync(itemPath);
                            if (itemStat.isDirectory()) scanDir(itemPath);
                            else if (item.endsWith('.md')) {
                                const questions = parseMarkdownFile(itemPath);
                                if (questions.length > 0) {
                                    console.log(`      - ${item}: ${questions.length} 题`);
                                    subjectQuestions.push(...questions);
                                }
                            }
                        }
                    };
                    scanDir(subjectDir);
                    
                    if (subjectQuestions.length > 0) {
                        if (!questionBank[userCode][subjectCode]) questionBank[userCode][subjectCode] = [];
                        questionBank[userCode][subjectCode].push(...subjectQuestions);
                        console.log(`    ✅ ${subject} 共 ${subjectQuestions.length} 题`);
                    }
                }
            }
        }
    }
    return questionBank;
}

console.log('🦐 学习虾题库生成器启动...\n');
const rawBank = scanMistakeBooks();

let totalQuestions = 0;
for (const user of ['左左', '右右']) {
    for (const questions of Object.values(rawBank[user] || {})) {
        totalQuestions += questions.length;
    }
}

console.log(`\n📊 题库统计：共 ${totalQuestions} 题`);
for (const user of ['左左', '右右']) {
    const userName = user === '左左' ? '左左' : '右右';
    console.log(`  ${userName}:`);
    for (const [subject, questions] of Object.entries(rawBank[user] || {})) {
        console.log(`    ${subject}: ${questions.length} 题`);
    }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rawBank, null, 2), 'utf-8');
console.log(`\n✅ 题库已保存：${OUTPUT_FILE}`);

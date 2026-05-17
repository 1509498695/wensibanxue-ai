import type { HistoryItemType } from './historyService'
import type {
  ArgumentGeneratorResult,
  EssayDiagnosisResult,
  MaterialRecommendResult,
  TopicAnalysisResult,
  WritingWorkflowResult,
} from '../types/results'
import {
  argumentGeneratorDemo,
  essayDiagnosisDemo,
  materialRecommendDemo,
  topicAnalysisDemo,
  writingWorkflowDemo,
} from '../data/demoResults'

export const DEMO_MODE_NOTICE = '当前为演示模式，已展示示例结果。'
export const API_KEY_REQUIRED_NOTICE = '请先配置 API Key，或开启演示模式。'

export const demoTopicAnalysisStructuredResult: TopicAnalysisResult = topicAnalysisDemo
export const demoArgumentGeneratorStructuredResult: ArgumentGeneratorResult = argumentGeneratorDemo
export const demoMaterialRecommendStructuredResult: MaterialRecommendResult = materialRecommendDemo
export const demoEssayDiagnosisStructuredResult: EssayDiagnosisResult = essayDiagnosisDemo
export const demoWritingWorkflowStructuredResult: WritingWorkflowResult = writingWorkflowDemo

const legacyDemoTopicAnalysisStructuredResult: TopicAnalysisResult = {
  keywords: ['责任', '担当', '青年', '时代', '行动', '价值'],
  coreTopic:
    '材料的核心不是简单赞美“责任”，而是引导学生思考：青年如何在时代需要中主动承担责任，并通过具体行动实现个人成长与社会价值。',
  recommendedIdeas: [
    '以责任意识回应时代召唤，在主动担当中体现青春价值。',
    '担当不是口号，而是面对困难时的选择与行动。',
    '青年应把个人理想融入国家发展，在时代坐标中完成自我成长。',
  ],
  writingAngles: [
    '从个人成长角度写：责任能促使青年走出舒适区，形成更成熟的人格。',
    '从时代使命角度写：时代为青年提供舞台，青年也应回应时代需要。',
    '从行动实践角度写：用具体行动证明担当，避免停留在空泛表态。',
  ],
  warnings: [
    '不要只写“我们要有责任”这类空泛口号。',
    '不要把责任写成单纯道德说教，要结合青年身份和时代背景。',
    '议论文要观点鲜明，分论点之间要有递进关系。',
  ],
  thinkingPrompts: [
    '这个立意能否结合你熟悉的生活经历？',
    '材料中的关键词之间是否存在递进或转折关系？',
    '你能否补充一个反面例子来避免观点单薄？',
  ],
}

const legacyDemoArgumentGeneratorStructuredResult: ArgumentGeneratorResult = {
  analysis: {
    keywords: ['青年', '时代', '主题', '关系', '使命', '担当'],
    coreTopic: '青年与时代的关系与互动。',
    writingFocus: '青年如何在时代中成长，又如何担当时代使命，推动时代发展。',
    warning: '不要把文章写成单纯赞美青年，也不要脱离时代背景。',
  },
  centralArguments: [
    '青年与时代同频共振，方能书写无悔人生。',
    '青年以担当回应时代，时代因青年而向前。',
    '时代为青年提供舞台，青年为时代注入希望。',
  ],
  recommendedArgument: '青年与时代同频共振，方能书写无悔人生。',
  subArguments: [
    { point: '青年应看见时代机遇，将个人理想融入时代洪流。', material: '科技创新、航天追梦' },
    { point: '青年要锤炼本领、勇担责任，在时代需要处发光发热。', material: '基层服务、乡村振兴' },
    { point: '青年与时代相互成就，共同创造更有希望的未来。', material: '青年榜样、志愿服务' },
  ],
  materials: [
    { type: '时评热点', content: '航天追梦、科技创新、乡村振兴中的青年力量' },
    { type: '青年奋斗', content: '青年榜样事迹、志愿服务、创业创新故事' },
    { type: '家国责任', content: '抗疫逆行者、国防建设、文化传承与使命担当' },
  ],
  thinkingPrompts: [
    '这个中心论点是否能统摄三个分论点？',
    '每个分论点之间是否有清晰的递进关系？',
    '你能否为其中一个分论点补充自己的观察？',
  ],
}

const legacyDemoMaterialRecommendStructuredResult: MaterialRecommendResult = {
  peopleExamples: [
    { name: '林则徐', description: '虎门销烟，体现面对民族危机时的家国责任与担当。' },
    { name: '钱学森', description: '冲破阻力归国报效祖国，体现科学家的家国情怀。' },
    { name: '黄文秀', description: '扎根基层扶贫一线，体现新时代青年的使命感与奉献精神。' },
  ],
  hotTopics: [
    '航天青年团队：在科技强国建设中贡献青春力量。',
    '乡村振兴青年干部：在基层一线实现个人价值。',
    '志愿服务群体：在社会需要中践行责任意识。',
  ],
  quotes: ['苟利国家生死以，岂因祸福避趋之。', '天下兴亡，匹夫有责。', '青年者，国家之魂。'],
  usageExample:
    '责任并不是停留在口号中的宏大词语，而是在关键时刻的主动选择。林则徐面对民族危机，挺身而出、虎门销烟，以实际行动诠释了“苟利国家生死以”的担当精神。对于新时代青年而言，责任同样意味着把个人理想融入国家发展，在时代需要的地方发光发热。',
  thinkingPrompts: [
    '这个素材是否能充分支撑中心论点？',
    '素材后是否需要增加一句分析来扣题？',
    '这个素材还能从哪些角度使用？',
  ],
}

const legacyDemoEssayDiagnosisStructuredResult: EssayDiagnosisResult = {
  totalScore: 44,
  level: '二等',
  percentile: '内容二等、表达一等、特征二等，整体处于中等偏上水平',
  dimensionScores: [
    {
      label: '内容',
      score: 15,
      grade: '二等',
      basis: '符合成长主题，中心较明确，但内容主要依赖个人经历，充实度还可提升。',
    },
    {
      label: '表达',
      score: 16,
      grade: '一等',
      basis: '基本符合文体要求，结构清楚，语言流畅，叙述自然。',
    },
    {
      label: '特征',
      score: 13,
      grade: '二等',
      basis: '有一定反思意识和表达亮点，但深刻性、丰富性与创意仍可加强。',
    },
  ],
  mainProblems: [
    { title: '论证不够深入', description: '文章整体较为平实，缺少对“成长为什么需要挫折”的进一步分析。' },
    { title: '素材运用单一', description: '主要依赖个人经历，缺少更有说服力的典型事例。' },
    { title: '语言表达略平淡', description: '部分句子偏直白，可以适当使用比喻、排比等修辞增强感染力。' },
  ],
  suggestions: [
    '在叙事后加入思考句，说明经历背后的成长意义。',
    '适当补充名人或现实素材，让观点更有支撑。',
    '优化段落过渡，使文章从“经历”自然走向“感悟”。',
    '结尾可以升华到未来行动，增强文章力量。',
  ],
  optimizedExample:
    '那次数学考试的失利，像一记清醒的警钟，让我明白：成长从不是一路坦途，而是在一次次跌倒后重新站起。老师的耐心讲解不仅帮我找到了错题原因，也让我懂得，真正的进步来自反思、坚持与重新出发的勇气。',
  nextPracticeSuggestions: [
    '选择原文中的一个叙事片段，补写两句反思性分析。',
    '为文章补充一个典型人物素材，并写清它如何支撑中心观点。',
    '重写结尾段，尝试从个人成长升华到未来行动。',
  ],
  thinkingPrompts: [
    '这段表达是否可以更具体？',
    '你的素材是否只是叙述，还缺少分析？',
    '结尾是否真正回扣了文章中心？',
  ],
}

const legacyDemoWritingWorkflowStructuredResult: WritingWorkflowResult = {
  topicAnalysis: {
    keywords: ['青年', '时代', '责任', '选择', '成长'],
    coreTopic: '材料引导学生思考青年如何在时代召唤中主动承担责任，并在行动中实现个人成长与社会价值。',
    warnings: [
      '不要只空泛赞美青年，要写清青年与时代之间的互动关系。',
      '不要把责任写成简单口号，要落到具体选择、行动和价值上。',
    ],
  },
  ideas: [
    '青年以责任回应时代，才能在担当中完成自我成长。',
    '把个人理想融入时代需要，青春才能获得更辽阔的价值。',
    '真正的担当不是豪言壮语，而是在关键处主动行动。',
  ],
  argumentStructure: {
    centralArgument: '青年与时代同频共振，方能在责任担当中书写有价值的人生。',
    subArguments: [
      { point: '青年要看见时代需要，明确自身责任。', logic: '先回答为什么要担当', material: '时代青年群像' },
      { point: '青年要锤炼能力，以行动承担责任。', logic: '再回答怎样担当', material: '科技创新、基层服务' },
      { point: '青年与时代相互成就，共同走向更好的未来。', logic: '最后升华价值', material: '乡村振兴、志愿服务' },
    ],
  },
  materials: [
    { title: '黄文秀', description: '扎根基层扶贫一线，用青春回应乡村振兴的时代需要。', angle: '青年担当' },
    { title: '航天青年团队', description: '在科研攻关中接续奋斗，体现科技强国中的青年力量。', angle: '本领与使命' },
    { title: '志愿服务群体', description: '在社会需要处主动行动，体现平凡岗位中的责任意识。', angle: '行动与价值' },
  ],
  outline: {
    title: '与时代同频，让青春有为',
    opening: '由材料中青年与时代的关系切入，提出“青春价值在回应时代中被照亮”的中心判断。',
    bodyParagraphs: [
      {
        title: '主体段一',
        topicSentence: '青年首先要看见时代需要，才能找到奋斗方向。',
        content: '分析个人理想不能脱离社会现实，时代命题为青年提供坐标。',
        material: '黄文秀扎根基层',
      },
      {
        title: '主体段二',
        topicSentence: '担当需要热情，更需要过硬本领和持续行动。',
        content: '从“想担当”推进到“能担当”，强调能力、坚持与实践。',
        material: '航天青年科研团队',
      },
      {
        title: '主体段三',
        topicSentence: '青年成就时代，时代也成就青年。',
        content: '回到青年与时代的双向关系，提升文章格局。',
        material: '志愿服务与乡村振兴',
      },
    ],
    ending: '总结青年应把小我融入大我，在时代需要的地方发光发热。',
  },
  thinkingQuestions: [
    '你的三个分论点之间是否有递进关系？',
    '每个素材后是否有分析句，而不是只叙述事例？',
    '结尾是否回扣了“青年”和“时代”两个关键词？',
  ],
  selfWritingReminder: 'AI 已帮你搭建思路，完整作文建议由你自己完成，这样才能真正提升写作能力。',
  thinkingPrompts: [
    '这个大纲是否留下了你自己的表达空间？',
    '主体段之间是否能自然过渡？',
    '你准备在哪一段加入自己的生活观察？',
  ],
}

void legacyDemoTopicAnalysisStructuredResult
void legacyDemoArgumentGeneratorStructuredResult
void legacyDemoMaterialRecommendStructuredResult
void legacyDemoEssayDiagnosisStructuredResult
void legacyDemoWritingWorkflowStructuredResult

function cloneDemoResult<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function getDemoTopicRefineResult(action: string): TopicAnalysisResult {
  const result = cloneDemoResult(demoTopicAnalysisStructuredResult)

  if (action === 'deepenIdeas') {
    result.coreTopic = '材料进一步指向“个体责任如何在时代关系中生成价值”：青年不只是承担任务，更是在责任实践中完成精神成长。'
    result.recommendedIdeas = [
      '责任的深处，是把个人选择放进时代坐标中衡量。青年越能回应公共需要，越能拓展生命价值。',
      ...(result.recommendedIdeas || []),
    ]
  } else if (action === 'lowerDifficulty') {
    result.coreTopic = '材料重点讨论青年怎样承担责任，并在行动中体现自己的价值。'
    result.recommendedIdeas = ['青年要从身边小事做起，用实际行动承担责任。', ...(result.recommendedIdeas || []).slice(0, 2)]
  } else if (action === 'addWarnings') {
    result.warnings = [
      ...(result.warnings || []),
      '不要把“责任”只写成个人努力，还要回应材料中的社会关系或时代背景。',
      '不要只堆叠榜样素材，要写清榜样行为和中心观点之间的逻辑。',
    ]
  } else if (action === 'generateAngles') {
    result.writingAngles = [
      '从“责任与选择”写：关键时刻的选择最能体现担当。',
      '从“责任与成长”写：承担责任会倒逼青年提升能力。',
      '从“责任与共同体”写：个人价值在回应他人和社会需要时被放大。',
    ]
  }

  return result
}

export function getDemoArgumentRefineResult(action: string): ArgumentGeneratorResult {
  const result = cloneDemoResult(demoArgumentGeneratorStructuredResult)

  if (action === 'deepenArguments') {
    result.recommendedArgument = '青年唯有把个人理想嵌入时代命题，才能在担当中完成自我与时代的双向成就。'
    result.centralArguments = [result.recommendedArgument, ...(result.centralArguments || []).slice(0, 2)]
  } else if (action === 'replaceArguments') {
    result.centralArguments = [
      '时代浪潮塑造青年品格，青年担当回应时代召唤。',
      '青年不是时代的旁观者，而应成为时代进步的参与者。',
      '把小我融入大我，青春才拥有更辽阔的意义。',
    ]
    result.recommendedArgument = '时代浪潮塑造青年品格，青年担当回应时代召唤。'
  } else if (action === 'generateOutline') {
    result.subArguments = [
      { point: '开篇扣题：指出青年与时代从来不是割裂关系。', logic: '提出中心观点', material: '时代青年群像' },
      { point: '主体一：时代为青年提供成长舞台。', logic: '由外部环境展开', material: '科技创新、文化传承' },
      { point: '主体二：青年以行动回应时代需要。', logic: '由个人担当深入', material: '基层服务、志愿行动' },
      { point: '结尾升华：在同频共振中书写青春价值。', logic: '回扣中心并提升高度', material: '青年使命' },
    ]
  } else if (action === 'matchMaterials') {
    result.materials = [
      ...(result.materials || []),
      { type: '科技创新', content: '青年科研团队攻坚关键技术，体现本领与担当。', angle: '时代机遇与青年责任' },
      { type: '基层实践', content: '青年干部扎根乡村振兴一线，体现小我融入大我。', angle: '个人价值与公共需要' },
    ]
  }

  return result
}

export function getDemoMaterialRefineResult(action: string): MaterialRecommendResult {
  const result = cloneDemoResult(demoMaterialRecommendStructuredResult)

  if (action === 'replaceMaterials') {
    result.peopleExamples = [
      { name: '袁隆平', description: '一生躬耕田野，以科研回应粮食安全这一时代命题。', angle: '责任与奉献' },
      { name: '张桂梅', description: '扎根山区教育，帮助更多学生看见人生可能。', angle: '坚守与担当' },
      { name: '邓稼先', description: '隐姓埋名投身国防科研，把个人理想融入国家需要。', angle: '家国情怀' },
    ]
  } else if (action === 'generateUsage') {
    result.usageExample =
      '担当不是抽象的姿态，而是面对现实需要时的主动选择。张桂梅多年扎根山区教育，把一间学校办成改变命运的起点；她的坚守说明，真正的责任往往不在宏大的口号里，而在日复一日的行动中。写作时可借此论证“责任需要长期主义，也需要把他人的需要放在心上”。'
  } else if (action === 'optimizeForExam') {
    result.hotTopics = [
      '科技自立自强：青年科研者在关键领域攻坚，适合论证使命与本领。',
      '乡村振兴：基层青年服务乡土，适合论证个人价值与时代需要。',
      '文化传承创新：年轻创作者让传统文化走近大众，适合论证守正与创新。',
    ]
  } else if (action === 'addQuotes') {
    result.quotes = [
      ...(result.quotes || []),
      '位卑未敢忘忧国。',
      '大道之行也，天下为公。',
      '知责任者，大丈夫之始也；行责任者，大丈夫之终也。',
    ]
  }

  return result
}

export function getDemoDiagnosisRefineResult(action: string): EssayDiagnosisResult {
  const result = cloneDemoResult(demoEssayDiagnosisStructuredResult)

  if (action === 'polishLanguage') {
    result.suggestions = [...(result.suggestions || []), '挑选两到三处关键句进行升格，加入更具体的画面和节奏变化。']
    result.optimizedExample =
      '那次失利像一盏突然亮起的灯，照见了我学习中的粗心与浮躁。重新整理错题时，我才明白：成长不是避开挫折，而是在挫折面前学会停下、回看，再更坚定地出发。'
  } else if (action === 'strengthenLogic') {
    result.dimensionScores = [
      {
        label: '内容',
        score: 16,
        grade: '一等',
        basis: '中心更突出，内容围绕成长与挫折展开更充分，思想健康、情感真挚。',
      },
      {
        label: '表达',
        score: 16,
        grade: '一等',
        basis: '结构更严谨，段落衔接更自然，语言表达保持流畅。',
      },
      {
        label: '特征',
        score: 14,
        grade: '二等',
        basis: '反思有所加深，有一定文采和新意，但丰富性仍可继续提升。',
      },
    ]
    result.totalScore = 46
    result.level = '二等'
    result.percentile = '内容一等、表达一等、特征二等，整体表现较好'
    result.suggestions = [...(result.suggestions || []), '每个事例后增加“为什么能证明观点”的分析句，避免只叙述不论证。']
  } else if (action === 'addMaterials') {
    result.suggestions = [...(result.suggestions || []), '可补充张桂梅、苏炳添等较熟悉素材，用来支撑“挫折促进成长”的观点。']
    result.mainProblems = [...(result.mainProblems || []), { title: '素材支撑不足', description: '文章缺少典型素材与现实例证，观点说服力还可以继续加强。' }]
  } else if (action === 'generatePractice') {
    result.suggestions = [
      ...(result.suggestions || []),
      '练习写一个“经历 + 反思 + 观点升华”的主体段。',
      '用同一素材分别写出叙述句、分析句和扣题句，训练论证闭环。',
    ]
  }

  return result
}

export function getDemoWritingWorkflowRefineResult(action: string): WritingWorkflowResult {
  const result = cloneDemoResult(demoWritingWorkflowStructuredResult)

  if (action === 'optimizeTopic') {
    result.topicAnalysis = {
      keywords: ['青年', '时代', '责任', '行动', '双向成就'],
      coreTopic: '材料重点不是泛泛歌颂青春，而是要求写清青年如何在时代命题中确认责任，并以行动实现个人成长与公共价值。',
      warnings: [
        '不要把“时代”只当背景词，要写出它对青年选择的具体影响。',
        '不要只写热血口号，要落到责任、能力和行动三个层面。',
        '注意写清青年与时代的双向关系，而不是单向赞美青年。',
      ],
    }
  } else if (action === 'deepenIdeas') {
    result.ideas = [
      '真正的青春价值，不在脱离时代的自我证明，而在回应公共需要时完成自我超越。',
      '时代命题既是青年的考卷，也是青年锤炼责任、能力与格局的课堂。',
      '青年与时代的关系不是被动适应，而是在主动担当中彼此成就。',
    ]
    result.argumentStructure = {
      centralArgument: '青年唯有把个人追求接入时代需要，才能在担当中实现自我与时代的双向成就。',
      subArguments: [
        { point: '看见时代需要，是青年确立责任的起点。', logic: '先明确责任来源', material: '时代青年群像' },
        { point: '回应时代需要，是青年锤炼能力的过程。', logic: '再展开行动路径', material: '航天青年团队' },
        { point: '成就时代进步，是青年实现价值的归宿。', logic: '最后完成价值升华', material: '基层服务、文化传承' },
      ],
    }
  } else if (action === 'optimizeOutline') {
    result.outline = {
      title: '以担当回应时代，以奋斗定义青春',
      opening: '从“时代给青年出题，青年以行动作答”切入，快速点明材料核心。',
      bodyParagraphs: [
        {
          title: '主体段一',
          topicSentence: '时代为青年标定方向，责任让理想不再悬空。',
          content: '先分析青年为什么不能只关注个人得失，而要把选择放入时代坐标。',
          material: '黄文秀扎根基层',
        },
        {
          title: '主体段二',
          topicSentence: '回应时代不能停留在热血中，还要落实为本领与行动。',
          content: '再展开青年如何锤炼能力、持续实践，避免空喊口号。',
          material: '航天青年团队',
        },
        {
          title: '主体段三',
          topicSentence: '当青年主动担当，个人成长与时代进步便能彼此成就。',
          content: '最后升华到青年与时代的双向奔赴，让文章收束更有高度。',
          material: '志愿服务群体',
        },
      ],
      ending: '以“青春不是旁观时代，而是在时代中主动发光”作结，回扣中心论点。',
    }
  } else if (action === 'replaceIdeas') {
    result.ideas = [
      '时代不是背景板，而是青年选择与成长的坐标。',
      '青年应在时代问题中寻找责任，在具体行动中证明价值。',
      '真正有力量的青春，是把个人追求与公共需要连接起来。',
    ]
    result.argumentStructure = {
      centralArgument: '青年把个人追求接入时代需要，才能让青春拥有更持久的力量。',
      subArguments: [
        { point: '时代问题为青年提供奋斗方向。', logic: '明确立意起点', material: '科技创新' },
        { point: '公共需要检验青年的责任意识。', logic: '强化行动维度', material: '基层服务' },
        { point: '个人价值在回应时代中被放大。', logic: '完成价值升华', material: '文化传承' },
      ],
    }
  } else if (action === 'strengthenArguments') {
    result.argumentStructure = {
      centralArgument: '青年要在时代坐标中看见责任、锤炼本领、落实行动，才能让青春真正有为。',
      subArguments: [
        { point: '看见时代坐标，青年才能明确“为何担当”。', logic: '从认识层面切入', material: '国家发展与青年选择' },
        { point: '锤炼过硬本领，青年才能回答“凭何担当”。', logic: '从能力层面递进', material: '科研攻关、技能成长' },
        { point: '投身具体行动，青年才能证明“如何担当”。', logic: '从实践层面落地', material: '基层服务、志愿行动' },
      ],
    }
  } else if (action === 'addMaterials') {
    result.materials = [
      ...(result.materials || []),
      { title: '苏翊鸣', description: '在热爱与训练中突破自我，体现青年追梦与时代机遇的结合。', angle: '个人理想与时代平台' },
      { title: '数字文博青年团队', description: '用新技术激活传统文化，让文化传承更贴近当代生活。', angle: '守正创新' },
    ]
  } else if (action === 'lowerDifficulty') {
    result.topicAnalysis = {
      keywords: ['青年', '时代', '责任', '行动'],
      coreTopic: '题目主要讨论青年怎样承担时代责任，并在行动中实现成长。',
      warnings: ['不要只喊口号，要写具体行动。', '不要脱离“青年”和“时代”两个关键词。'],
    }
    result.ideas = [
      '青年要承担责任，在时代需要中实现自己的价值。',
      '把个人理想和时代发展结合起来，青春才更有意义。',
      '担当不是口号，而是一步步做好具体事情。',
    ]
    result.argumentStructure = {
      centralArgument: '青年要用实际行动回应时代需要，让青春更有价值。',
      subArguments: [
        { point: '青年要看见时代需要。', logic: '先写为什么要担当', material: '时代青年群像' },
        { point: '青年要提升能力、主动行动。', logic: '再写怎样担当', material: '航天青年、志愿服务' },
        { point: '青年能在担当中获得成长。', logic: '最后写意义', material: '基层服务、乡村振兴' },
      ],
    }
    result.outline = {
      title: '用行动回应时代',
      opening: '从材料中的青年责任切入，提出青年应主动担当。',
      bodyParagraphs: [
        { title: '主体段一', topicSentence: '青年要先看见时代需要。', content: '说明个人成长不能脱离社会背景。', material: '黄文秀' },
        { title: '主体段二', topicSentence: '担当要落实为具体行动。', content: '写清青年需要能力和坚持。', material: '航天青年团队' },
        { title: '主体段三', topicSentence: '行动能让青春更有价值。', content: '总结青年和时代可以互相成就。', material: '志愿服务' },
      ],
      ending: '回扣青年责任，号召以行动书写青春。',
    }
  }

  return result
}

export const demoTopicAnalysisResult = `## 关键词

- 责任
- 担当
- 青年
- 时代
- 行动
- 价值

## 核心命题

材料的核心不是简单赞美“责任”，而是引导学生思考：青年如何在时代需要中主动承担责任，并通过具体行动实现个人成长与社会价值。

## 推荐立意

1. 以责任意识回应时代召唤，在主动担当中体现青春价值。
2. 担当不是口号，而是面对困难时的选择与行动。
3. 青年应把个人理想融入国家发展，在时代坐标中完成自我成长。

## 写作角度

- 从个人成长角度写：责任能促使青年走出舒适区，形成更成熟的人格。
- 从时代使命角度写：时代为青年提供舞台，青年也应回应时代需要。
- 从行动实践角度写：用具体行动证明担当，避免停留在空泛表态。

## 避坑提醒

- 不要只写“我们要有责任”这类空泛口号。
- 不要把责任写成单纯道德说教，要结合青年身份和时代背景。
- 议论文要观点鲜明，分论点之间要有递进关系。`

export const demoArgumentGeneratorResult = `## 题目分析

题目“青年与时代”包含两个关键词：“青年”强调写作主体，“时代”强调背景与使命。写作重点应放在二者的互动关系：时代塑造青年，青年也推动时代向前。

## 可选中心论点

1. 青年与时代同频共振，方能书写无悔人生。
2. 青年以担当回应时代，时代因青年而向前。
3. 时代为青年提供舞台，青年为时代注入希望。

## 推荐中心论点

青年与时代同频共振，方能书写无悔人生。

这个论点较稳妥，既能写青年成长，也能写时代责任，适合展开递进式论证。

## 分论点结构

1. 青年应看见时代机遇，将个人理想融入时代洪流。
2. 青年要锤炼本领、勇担责任，在时代需要处发光发热。
3. 青年与时代相互成就，共同创造更有希望的未来。

## 推荐素材方向

- 航天青年团队：体现科技强国中的青春力量。
- 黄文秀扎根基层：体现青年担当与奉献精神。
- 志愿服务与乡村振兴：体现青年在基层一线实现价值。

## 写作提醒

不要把文章写成单纯赞美青年，也不要脱离时代背景。每个分论点都应回答“青年如何与时代发生关系”。`

export const demoMaterialRecommendResult = `## 人物事例

1. 林则徐：虎门销烟，体现面对民族危机时的家国责任与担当。
2. 钱学森：冲破阻力归国报效祖国，体现科学家的家国情怀。
3. 黄文秀：扎根基层扶贫一线，体现新时代青年的使命感与奉献精神。

## 时评热点

1. 航天青年团队：在科技强国建设中贡献青春力量。
2. 乡村振兴青年干部：在基层一线实现个人价值。
3. 志愿服务群体：在社会需要中践行责任意识。

## 名言警句

- 苟利国家生死以，岂因祸福避趋之。
- 天下兴亡，匹夫有责。
- 青年者，国家之魂。

## 适用角度

- 责任与担当
- 青年成长
- 家国情怀
- 个人理想与时代使命

## 使用示范

责任并不是停留在口号中的宏大词语，而是在关键时刻的主动选择。林则徐面对民族危机，挺身而出、虎门销烟，以实际行动诠释了“苟利国家生死以”的担当精神。对于新时代青年而言，责任同样意味着把个人理想融入国家发展，在时代需要的地方发光发热。`

export const demoEssayDiagnosisResult = `## 综合评分

44 / 60，整体达到“二等”水平。文章主题明确，情感真诚，但内容充实度和发展特征仍有提升空间。

## 维度评分

- 内容：15 / 20（二等）- 符合成长主题，中心较明确，但内容主要依赖个人经历，充实度还可提升。
- 表达：16 / 20（一等）- 基本符合文体要求，结构清楚，语言流畅，叙述自然。
- 特征：13 / 20（二等）- 有一定反思意识和表达亮点，但深刻性、丰富性与创意仍可加强。

## 主要问题

1. 论证不够深入：文章整体较为平实，缺少对“成长为什么需要挫折”的进一步分析。
2. 素材运用单一：主要依赖个人经历，缺少更有说服力的典型事例。
3. 语言表达略平淡：部分句子偏直白，可以适当使用比喻、排比等修辞增强感染力。

## 修改建议

- 在叙事后加入思考句，说明经历背后的成长意义。
- 适当补充名人或现实素材，让观点更有支撑。
- 优化段落过渡，使文章从“经历”自然走向“感悟”。
- 结尾可以升华到未来行动，增强文章力量。

## 优化示例

那次数学考试的失利，像一记清醒的警钟，让我明白：成长从不是一路坦途，而是在一次次跌倒后重新站起。老师的耐心讲解不仅帮我找到了错题原因，也让我懂得，真正的进步来自反思、坚持与重新出发的勇气。

## 下一步练习建议

建议下一篇作文尝试使用“个人经历 + 典型人物素材 + 现实意义”的结构，重点训练议论文中的分析段落。`

export const demoRecentItems: Array<{
  title: string
  tag: string
  tone: 'blue' | 'purple' | 'teal' | 'orange'
  time: string
  type: HistoryItemType
}> = [
  { title: '谈青年与责任担当', tag: '论点生成', tone: 'purple', time: '演示记录', type: 'argument' },
  { title: '责任的利弊与边界', tag: '升格思辨', tone: 'blue', time: '演示记录', type: 'topic' },
  { title: '坚守本心，方得始终', tag: '作文诊断', tone: 'orange', time: '演示记录', type: 'diagnosis' },
  { title: '责任与担当素材推荐', tag: '素材推荐', tone: 'teal', time: '演示记录', type: 'material' },
  { title: '青年与时代五步写作', tag: '五步写作', tone: 'blue', time: '演示记录', type: 'workflow' },
]

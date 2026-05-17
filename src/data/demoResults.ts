import type {
  ArgumentGeneratorResult,
  EssayDiagnosisResult,
  MaterialRecommendResult,
  TopicAnalysisResult,
  WritingWorkflowResult,
} from '../types/results'

export const topicAnalysisDemo: TopicAnalysisResult = {
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
  thinkingPrompts: ['这个立意能否结合你熟悉的生活经历？', '材料中的关键词之间是否存在递进或转折关系？', '你能否补充一个反面例子来避免观点单薄？'],
}

export const argumentGeneratorDemo: ArgumentGeneratorResult = {
  analysis: {
    keywords: ['青年', '时代', '主题', '关系', '使命', '担当'],
    coreTopic: '青年与时代的关系与互动。',
    writingFocus: '青年如何在时代中成长，又如何担当时代使命，推动时代发展。',
    warning: '不要把文章写成单纯赞美青年，也不要脱离时代背景。',
  },
  recommendedIdeas: [
    '青年应在回应时代需要中完成自我成长。',
    '个人理想只有融入时代坐标，才能获得更深远的价值。',
    '真正的青春担当，是把热情落实为持续行动。',
  ],
  warnings: [
    '不要只写“青年很重要”，要写清青年与时代的互动关系。',
    '不要把时代当成空泛背景，要落到具体任务、选择和行动。',
    '不要堆叠口号，分论点之间要有清晰层次。',
  ],
  centralArguments: ['青年与时代同频共振，方能书写无悔人生。', '青年以担当回应时代，时代因青年而向前。', '时代为青年提供舞台，青年为时代注入希望。'],
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
  thinkingPrompts: ['这个中心论点是否能统摄三个分论点？', '每个分论点之间是否有清晰的递进关系？', '你能否为其中一个分论点补充自己的观察？'],
}

export const materialRecommendDemo: MaterialRecommendResult = {
  peopleExamples: [
    { name: '林则徐', description: '虎门销烟，体现面对民族危机时的家国责任与担当。' },
    { name: '钱学森', description: '冲破阻力归国报效祖国，体现科学家的家国情怀。' },
    { name: '黄文秀', description: '扎根基层扶贫一线，体现新时代青年的使命感与奉献精神。' },
  ],
  hotTopics: ['航天青年团队：在科技强国建设中贡献青春力量。', '乡村振兴青年干部：在基层一线实现个人价值。', '志愿服务群体：在社会需要中践行责任意识。'],
  quotes: ['苟利国家生死以，岂因祸福避趋之。', '天下兴亡，匹夫有责。', '青年者，国家之魂。'],
  usageExample:
    '责任并不是停留在口号中的宏大词语，而是在关键时刻的主动选择。林则徐面对民族危机，挺身而出、虎门销烟，以实际行动诠释了“苟利国家生死以”的担当精神。对于新时代青年而言，责任同样意味着把个人理想融入国家发展，在时代需要的地方发光发热。',
  thinkingPrompts: ['这个素材是否能充分支撑中心论点？', '素材后是否需要增加一句分析来扣题？', '这个素材还能从哪些角度使用？'],
}

export const essayDiagnosisDemo: EssayDiagnosisResult = {
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
  suggestions: ['在叙事后加入思考句，说明经历背后的成长意义。', '适当补充名人或现实素材，让观点更有支撑。', '优化段落过渡，使文章从“经历”自然走向“感悟”。', '结尾可以升华到未来行动，增强文章力量。'],
  optimizedExample:
    '那次数学考试的失利，像一记清醒的警钟，让我明白：成长从不是一路坦途，而是在一次次跌倒后重新站起。老师的耐心讲解不仅帮我找到了错题原因，也让我懂得，真正的进步来自反思、坚持与重新出发的勇气。',
  nextPracticeSuggestions: ['选择原文中的一个叙事片段，补写两句反思性分析。', '为文章补充一个典型人物素材，并写清它如何支撑中心观点。', '重写结尾段，尝试从个人成长升华到未来行动。'],
  thinkingPrompts: ['这段表达是否可以更具体？', '你的素材是否只是叙述，还缺少分析？', '结尾是否真正回扣了文章中心？'],
}

export const writingWorkflowDemo: WritingWorkflowResult = {
  topicAnalysis: {
    keywords: ['青年', '时代', '责任', '选择', '成长'],
    coreTopic: '材料引导学生思考青年如何在时代召唤中主动承担责任，并在行动中实现个人成长与社会价值。',
    warnings: ['不要只空泛赞美青年，要写清青年与时代之间的互动关系。', '不要把责任写成简单口号，要落到具体选择、行动和价值上。'],
  },
  ideas: ['青年以责任回应时代，才能在担当中完成自我成长。', '把个人理想融入时代需要，青春才能获得更辽阔的价值。', '真正的担当不是豪言壮语，而是在关键处主动行动。'],
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
      { title: '主体段一', topicSentence: '青年首先要看见时代需要，才能找到奋斗方向。', content: '分析个人理想不能脱离社会现实，时代命题为青年提供坐标。', material: '黄文秀扎根基层' },
      { title: '主体段二', topicSentence: '担当需要热情，更需要过硬本领和持续行动。', content: '从“想担当”推进到“能担当”，强调能力、坚持与实践。', material: '航天青年科研团队' },
      { title: '主体段三', topicSentence: '青年成就时代，时代也成就青年。', content: '回到青年与时代的双向关系，提升文章格局。', material: '志愿服务与乡村振兴' },
    ],
    ending: '总结青年应把小我融入大我，在时代需要的地方发光发热。',
  },
  thinkingQuestions: ['你的三个分论点之间是否有递进关系？', '每个素材后是否有分析句，而不是只叙述事例？', '结尾是否回扣了“青年”和“时代”两个关键词？'],
  selfWritingReminder: 'AI 已帮你搭建思路，完整作文建议由你自己完成，这样才能真正提升写作能力。',
  thinkingPrompts: ['这个大纲是否留下了你自己的表达空间？', '主体段之间是否能自然过渡？', '你准备在哪一段加入自己的生活观察？'],
}

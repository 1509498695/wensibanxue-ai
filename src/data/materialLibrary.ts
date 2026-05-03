import type { MaterialRecommendResult, ResultTextItem, WritingWorkflowResult } from '../types/results'

export type MaterialExample = {
  id: string
  title: string
  description: string
  angle: string
}

export type QuoteItem = {
  id: string
  content: string
  source: string
  angle: string
}

export type MaterialLibraryTopic = {
  id: string
  title: string
  description: string
  peopleExamples: MaterialExample[]
  hotTopics: MaterialExample[]
  quotes: QuoteItem[]
  angles: string[]
  usageExample: string
}

export type LocalMaterialItem = {
  id: string
  topicId: string
  topicTitle: string
  type: '人物事例' | '时评热点' | '名言警句' | '适用角度' | '使用示范'
  title: string
  description: string
  angle?: string
}

export const materialLibrary: MaterialLibraryTopic[] = [
  {
    id: 'home-country',
    title: '家国情怀',
    description: '适合论证个人理想与国家发展、公共责任、时代使命之间的关系。',
    peopleExamples: [
      { id: 'home-country-qian', title: '钱学森', description: '冲破阻力回到祖国，投身航天事业，把个人才华融入国家需要。', angle: '个人理想与国家使命' },
      { id: 'home-country-deng', title: '邓稼先', description: '隐姓埋名投身国防科研，在荒凉戈壁中托举民族脊梁。', angle: '奉献与担当' },
      { id: 'home-country-lin', title: '林则徐', description: '面对民族危机坚决禁烟，以行动守护国家尊严和人民利益。', angle: '责任勇气' },
    ],
    hotTopics: [
      { id: 'home-country-space', title: '中国航天接续突破', description: '一代代科研人员协同攻关，让探索星辰大海成为国家实力的注脚。', angle: '科技报国' },
      { id: 'home-country-border', title: '边防守护与平凡坚守', description: '许多人长期守护边疆、海岛和基层岗位，让家国情怀落在日常行动中。', angle: '坚守岗位' },
      { id: 'home-country-relief', title: '重大灾害中的互助行动', description: '救援人员、志愿者和普通人迅速行动，体现共同体意识。', angle: '公共责任' },
    ],
    quotes: [
      { id: 'home-country-q1', content: '苟利国家生死以，岂因祸福避趋之。', source: '林则徐', angle: '家国担当' },
      { id: 'home-country-q2', content: '天下兴亡，匹夫有责。', source: '顾炎武', angle: '公共责任' },
      { id: 'home-country-q3', content: '位卑未敢忘忧国。', source: '陆游', angle: '身份与责任' },
      { id: 'home-country-q4', content: '捐躯赴国难，视死忽如归。', source: '曹植', angle: '使命担当' },
      { id: 'home-country-q5', content: '先天下之忧而忧，后天下之乐而乐。', source: '范仲淹', angle: '忧乐观' },
    ],
    angles: ['把小我融入大我', '个人选择回应时代需要', '家国情怀不是口号而是行动'],
    usageExample:
      '家国情怀并不只存在于宏大的誓言里，更体现在关键时刻的选择中。钱学森放弃优厚条件回到祖国，把个人学识投入国家科技事业；他的选择说明，真正有重量的理想，往往会主动与国家需要同频共振。',
  },
  {
    id: 'youth-struggle',
    title: '青春奋斗',
    description: '适合论证青年成长、持续努力、理想追求和自我突破。',
    peopleExamples: [
      { id: 'youth-struggle-su', title: '苏炳添', description: '长期坚持科学训练，不断突破年龄和身体极限，刷新亚洲速度。', angle: '坚持与突破' },
      { id: 'youth-struggle-quan', title: '全红婵', description: '以刻苦训练打磨动作细节，在赛场上展现年轻人的专注与韧性。', angle: '专注成长' },
      { id: 'youth-struggle-huang', title: '黄文秀', description: '主动回到基层扶贫一线，用青春脚步丈量乡土责任。', angle: '青春选择' },
    ],
    hotTopics: [
      { id: 'youth-struggle-skills', title: '技能人才走上大舞台', description: '年轻工匠通过反复练习和技术钻研，在平凡岗位上实现价值。', angle: '平凡奋斗' },
      { id: 'youth-struggle-volunteer', title: '青年志愿服务', description: '越来越多年轻人参与社区、赛事和公益服务，在实践中理解责任。', angle: '行动成长' },
      { id: 'youth-struggle-startup', title: '青年创新创业', description: '年轻团队在新领域试错、迭代、突破，展示敢闯敢试的精神。', angle: '探索精神' },
    ],
    quotes: [
      { id: 'youth-struggle-q1', content: '青春须早为，岂能长少年。', source: '孟郊', angle: '珍惜青春' },
      { id: 'youth-struggle-q2', content: '路虽远，行则将至；事虽难，做则必成。', source: '荀子', angle: '行动与坚持' },
      { id: 'youth-struggle-q3', content: '千磨万击还坚劲，任尔东西南北风。', source: '郑燮', angle: '韧性' },
      { id: 'youth-struggle-q4', content: '少年辛苦终身事，莫向光阴惰寸功。', source: '杜荀鹤', angle: '勤勉' },
      { id: 'youth-struggle-q5', content: '志不求易者成，事不避难者进。', source: '《后汉书》', angle: '迎难而上' },
    ],
    angles: ['奋斗让青春获得厚度', '热爱需要长期坚持支撑', '青年应在实践中完成自我塑造'],
    usageExample:
      '奋斗不是一时热血，而是长久的自我要求。苏炳添多年坚持科学训练，在无数次细节调整中突破极限。他的经历提醒我们，青春的光芒并非来自轻松的胜利，而来自不断向前的脚步。',
  },
  {
    id: 'responsibility',
    title: '责任担当',
    description: '适合论证责任意识、公共精神、岗位坚守和主动作为。',
    peopleExamples: [
      { id: 'responsibility-zhang', title: '张桂梅', description: '扎根山区教育，帮助更多学生走出大山，用坚守诠释责任。', angle: '教育担当' },
      { id: 'responsibility-yuan', title: '袁隆平', description: '一生躬耕田野，以科研回应粮食安全这一重大命题。', angle: '科研责任' },
      { id: 'responsibility-du', title: '杜富国', description: '排雷任务中挺身而出，以无畏选择守护战友安全。', angle: '关键时刻的担当' },
    ],
    hotTopics: [
      { id: 'responsibility-rural', title: '乡村振兴中的基层力量', description: '基层工作者长期扎根一线，把责任落到具体治理和服务中。', angle: '长期主义' },
      { id: 'responsibility-medical', title: '医护群体守护生命', description: '面对压力和风险，医护人员用专业与坚守回应社会需要。', angle: '职业责任' },
      { id: 'responsibility-community', title: '社区治理中的普通人', description: '志愿者、网格员和居民共同参与，让责任成为公共生活的纽带。', angle: '共同体意识' },
    ],
    quotes: [
      { id: 'responsibility-q1', content: '知责任者，大丈夫之始也；行责任者，大丈夫之终也。', source: '梁启超', angle: '知行合一' },
      { id: 'responsibility-q2', content: '鞠躬尽瘁，死而后已。', source: '诸葛亮', angle: '尽责' },
      { id: 'responsibility-q3', content: '凡是我受过他好处的人，我对于他便有了责任。', source: '梁启超', angle: '关系与责任' },
      { id: 'responsibility-q4', content: '天下难事，必作于易；天下大事，必作于细。', source: '《道德经》', angle: '细处担当' },
      { id: 'responsibility-q5', content: '士不可以不弘毅，任重而道远。', source: '《论语》', angle: '使命与毅力' },
    ],
    angles: ['责任不是口号而是行动', '担当体现在困难面前的选择', '平凡岗位也能承载公共价值'],
    usageExample:
      '责任的价值，常常在长期坚守中显现。张桂梅多年扎根山区教育，把一所学校办成许多学生改变命运的起点。她的故事说明，担当不是一瞬间的姿态，而是在日复一日的行动中把他人的需要放在心上。',
  },
  {
    id: 'cultural-confidence',
    title: '文化自信',
    description: '适合论证文化传承、文化创新、民族精神和当代表达。',
    peopleExamples: [
      { id: 'cultural-confidence-fan', title: '樊锦诗', description: '长期守护敦煌文物，推动文化遗产保护与传播。', angle: '文化守护' },
      { id: 'cultural-confidence-shan', title: '单霁翔', description: '推动博物馆走近大众，让传统文化以更亲切的方式被看见。', angle: '传播创新' },
      { id: 'cultural-confidence-ye', title: '叶嘉莹', description: '一生讲授古典诗词，让诗教传统在当代延续。', angle: '精神传承' },
    ],
    hotTopics: [
      { id: 'cultural-confidence-museum', title: '博物馆热与文创出圈', description: '文物通过展览、文创和数字传播进入日常生活。', angle: '传统走向当代' },
      { id: 'cultural-confidence-dance', title: '传统舞蹈节目走红', description: '舞台艺术以现代审美激活传统意象，增强文化亲近感。', angle: '创造性转化' },
      { id: 'cultural-confidence-digital', title: '数字技术助力文化传播', description: '数字展陈、云游博物馆等方式拓展文化传播边界。', angle: '科技与文化融合' },
    ],
    quotes: [
      { id: 'cultural-confidence-q1', content: '求木之长者，必固其根本。', source: '魏徵', angle: '文化根基' },
      { id: 'cultural-confidence-q2', content: '文变染乎世情，兴废系乎时序。', source: '刘勰', angle: '文化与时代' },
      { id: 'cultural-confidence-q3', content: '周虽旧邦，其命维新。', source: '《诗经》', angle: '守正创新' },
      { id: 'cultural-confidence-q4', content: '观乎人文，以化成天下。', source: '《周易》', angle: '文化教化' },
      { id: 'cultural-confidence-q5', content: '各美其美，美人之美，美美与共。', source: '费孝通', angle: '文化交流' },
    ],
    angles: ['文化自信来自理解与热爱', '传承需要创新表达', '传统文化能回应当代生活'],
    usageExample:
      '文化自信不是简单复古，而是在理解传统的基础上创造新的表达。博物馆文创和数字展陈让文物走出展柜、走近日常，使更多人愿意主动了解传统文化。这说明，真正有生命力的传承，既守住根脉，也面向当代。',
  },
  {
    id: 'technology-innovation',
    title: '科技创新',
    description: '适合论证创新精神、科学探索、关键技术突破和理性使用科技。',
    peopleExamples: [
      { id: 'technology-innovation-tu', title: '屠呦呦', description: '从传统医学中寻找灵感，带领团队发现青蒿素，造福世界。', angle: '科学探索' },
      { id: 'technology-innovation-nan', title: '南仁东', description: '主持 FAST 工程建设，把宏大科学梦想落成现实。', angle: '追求卓越' },
      { id: 'technology-innovation-huang', title: '黄大年', description: '归国投身科研教学，以专业力量服务科技发展。', angle: '科技报国' },
    ],
    hotTopics: [
      { id: 'technology-innovation-ai', title: '人工智能走进学习与生活', description: 'AI 提升效率，也提醒人们保持独立思考和伦理意识。', angle: '技术与人的关系' },
      { id: 'technology-innovation-space', title: '深空探测持续推进', description: '航天工程体现协同创新和持续攻关的力量。', angle: '探索精神' },
      { id: 'technology-innovation-green', title: '绿色技术发展', description: '新能源、低碳技术推动发展方式转型。', angle: '创新与可持续' },
    ],
    quotes: [
      { id: 'technology-innovation-q1', content: '苟日新，日日新，又日新。', source: '《礼记》', angle: '持续创新' },
      { id: 'technology-innovation-q2', content: '不日新者必日退。', source: '程颢、程颐', angle: '进步意识' },
      { id: 'technology-innovation-q3', content: '科学没有平坦的大道。', source: '马克思', angle: '探索艰辛' },
      { id: 'technology-innovation-q4', content: '路漫漫其修远兮，吾将上下而求索。', source: '屈原', angle: '求索精神' },
      { id: 'technology-innovation-q5', content: '满眼生机转化钧，天工人巧日争新。', source: '赵翼', angle: '创新活力' },
    ],
    angles: ['创新需要长期积累', '科技应服务人的发展', '探索未知体现时代精神'],
    usageExample:
      '科技创新从不是凭空而来，而是长期求索后的突破。屠呦呦团队在反复实验中发现青蒿素，让古老智慧与现代科学相遇。这个素材可用于说明：真正的创新既需要开放视野，也需要严谨耐心。',
  },
  {
    id: 'traditional-culture',
    title: '传统文化',
    description: '适合论证经典、礼俗、非遗、审美精神和传统的当代价值。',
    peopleExamples: [
      { id: 'traditional-culture-wang', title: '王津', description: '长期修复古钟表，让精密文物在耐心与匠心中重获生机。', angle: '工匠精神' },
      { id: 'traditional-culture-li', title: '李子柒', description: '用影像呈现乡土生活和传统技艺，让传统美学被更多人看见。', angle: '传播表达' },
      { id: 'traditional-culture-mao', title: '毛胜利', description: '坚守传统制笔技艺，在细微工序中延续非遗生命。', angle: '技艺传承' },
    ],
    hotTopics: [
      { id: 'traditional-culture-festival', title: '传统节日焕发新活力', description: '节日民俗通过文旅、教育和新媒体传播重新走近年轻人。', angle: '传统与生活' },
      { id: 'traditional-culture-heritage', title: '非遗进校园与社区', description: '传统技艺通过体验活动获得新的传承场景。', angle: '活态传承' },
      { id: 'traditional-culture-poetry', title: '诗词类节目受欢迎', description: '经典文本通过现代传播方式激发大众审美兴趣。', angle: '经典再生' },
    ],
    quotes: [
      { id: 'traditional-culture-q1', content: '不忘本来，才能开辟未来。', source: '常用表达', angle: '传承与发展' },
      { id: 'traditional-culture-q2', content: '温故而知新，可以为师矣。', source: '《论语》', angle: '传统启新' },
      { id: 'traditional-culture-q3', content: '人能弘道，非道弘人。', source: '《论语》', angle: '人的传承责任' },
      { id: 'traditional-culture-q4', content: '岁寒，然后知松柏之后凋也。', source: '《论语》', angle: '精神品格' },
      { id: 'traditional-culture-q5', content: '凡益之道，与时偕行。', source: '《周易》', angle: '与时俱进' },
    ],
    angles: ['传统要进入当代生活', '传承需要人的耐心与创造', '经典能滋养现代精神'],
    usageExample:
      '传统文化的生命力，来自一代代人的守护与再创造。古钟表修复师王津以耐心修复文物，让沉睡的时间重新转动；这说明，传统不是陈旧的符号，而是在匠心传承中不断被重新点亮。',
  },
  {
    id: 'human-nature',
    title: '人与自然',
    description: '适合论证生态文明、敬畏自然、绿色发展和生命共同体。',
    peopleExamples: [
      { id: 'human-nature-saihanba', title: '塞罕坝建设者', description: '数代人坚持植树造林，把荒原变成林海。', angle: '生态坚守' },
      { id: 'human-nature-jane', title: '珍·古道尔', description: '长期观察黑猩猩，倡导尊重生命和保护自然。', angle: '生命关怀' },
      { id: 'human-nature-liu', title: '刘先平', description: '长期进行自然文学写作，引导读者亲近自然、理解生态。', angle: '自然教育' },
    ],
    hotTopics: [
      { id: 'human-nature-green', title: '绿色低碳生活', description: '节能、减塑、绿色出行成为普通人参与环保的方式。', angle: '日常行动' },
      { id: 'human-nature-park', title: '国家公园体系建设', description: '保护生态空间，也让人与自然关系更有边界感。', angle: '制度保护' },
      { id: 'human-nature-biodiversity', title: '生物多样性保护', description: '珍稀物种保护和栖息地修复体现生命共同体理念。', angle: '共生意识' },
    ],
    quotes: [
      { id: 'human-nature-q1', content: '万物各得其和以生，各得其养以成。', source: '《荀子》', angle: '和谐共生' },
      { id: 'human-nature-q2', content: '天行有常，不为尧存，不为桀亡。', source: '《荀子》', angle: '尊重规律' },
      { id: 'human-nature-q3', content: '草木荣华滋硕之时，则斧斤不入山林。', source: '《孟子》', angle: '有度利用' },
      { id: 'human-nature-q4', content: '取之有度，用之有节，则常足。', source: '《资治通鉴》', angle: '节制' },
      { id: 'human-nature-q5', content: '人法地，地法天，天法道，道法自然。', source: '《道德经》', angle: '顺应自然' },
    ],
    angles: ['尊重自然规律', '绿色发展需要长期行动', '人与自然是生命共同体'],
    usageExample:
      '人与自然的关系，考验着人类的远见。塞罕坝建设者用数十年坚守把荒原变成林海，证明生态修复不是短期工程，而是代代接力的责任。写作时可借此论证：敬畏自然，最终也是守护人类自身的未来。',
  },
  {
    id: 'growth-thinking',
    title: '成长思辨',
    description: '适合论证挫折、选择、自律、独立思考和自我完善。',
    peopleExamples: [
      { id: 'growth-thinking-jiang', title: '江梦南', description: '在听力障碍中坚持学习，以自强不息打开人生道路。', angle: '逆境成长' },
      { id: 'growth-thinking-shi', title: '史铁生', description: '在困境中重新思考生命意义，用写作抵达精神深处。', angle: '苦难与思考' },
      { id: 'growth-thinking-yang', title: '杨宁', description: '返乡投身基层建设，在选择中找到更宽广的人生价值。', angle: '选择与价值' },
    ],
    hotTopics: [
      { id: 'growth-thinking-phone', title: '数字时代的自律挑战', description: '信息过载让人更需要筛选能力和专注力。', angle: '自律与自由' },
      { id: 'growth-thinking-pressure', title: '面对压力的心理成长', description: '学习、竞争和生活压力提醒人们建立健康的自我调适方式。', angle: '韧性' },
      { id: 'growth-thinking-gap', title: '成长中的差异与选择', description: '不同路径并不意味着高下之分，关键在于清醒选择与持续行动。', angle: '多元成长' },
    ],
    quotes: [
      { id: 'growth-thinking-q1', content: '知人者智，自知者明。', source: '《道德经》', angle: '认识自我' },
      { id: 'growth-thinking-q2', content: '君子求诸己，小人求诸人。', source: '《论语》', angle: '自我反省' },
      { id: 'growth-thinking-q3', content: '不怨天，不尤人。', source: '《论语》', angle: '积极面对' },
      { id: 'growth-thinking-q4', content: '艰难困苦，玉汝于成。', source: '常用格言', angle: '挫折成长' },
      { id: 'growth-thinking-q5', content: '胜人者有力，自胜者强。', source: '《道德经》', angle: '自我超越' },
    ],
    angles: ['成长需要反思而非抱怨', '挫折能倒逼自我更新', '真正的成熟是学会选择并负责'],
    usageExample:
      '成长不只是顺境中的积累，也是在困境中的重新认识自己。江梦南面对听力障碍没有停留在抱怨中，而是以长期努力打开人生道路。这个素材可用于说明：挫折本身并不会自动成就人，真正重要的是面对挫折时的选择与行动。',
  },
]

export const defaultMaterialLibraryTopicId = 'responsibility'

const topicMatchKeywords: Record<string, string[]> = {
  'home-country': ['家国', '祖国', '国家', '民族', '时代', '使命', '报国', '天下'],
  'youth-struggle': ['青春', '青年', '奋斗', '拼搏', '理想', '热爱', '突破', '坚持'],
  responsibility: ['责任', '担当', '坚守', '奉献', '使命', '岗位', '公共'],
  'cultural-confidence': ['文化自信', '文化', '自信', '敦煌', '博物馆', '传播', '创新表达'],
  'technology-innovation': ['科技', '创新', '科学', '人工智能', '航天', '探索', '技术'],
  'traditional-culture': ['传统', '非遗', '节日', '诗词', '经典', '匠心', '传承'],
  'human-nature': ['自然', '生态', '环保', '绿色', '低碳', '生命', '共生'],
  'growth-thinking': ['成长', '挫折', '选择', '自律', '反思', '压力', '成熟'],
}

export function getMaterialLibraryTopic(topicId: string) {
  return materialLibrary.find((topic) => topic.id === topicId) || materialLibrary[0]
}

function includesKeyword(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase())
}

function exampleToLocalItem(topic: MaterialLibraryTopic, type: LocalMaterialItem['type'], item: MaterialExample): LocalMaterialItem {
  return {
    id: item.id,
    topicId: topic.id,
    topicTitle: topic.title,
    type,
    title: item.title,
    description: item.description,
    angle: item.angle,
  }
}

function quoteToLocalItem(topic: MaterialLibraryTopic, item: QuoteItem): LocalMaterialItem {
  return {
    id: item.id,
    topicId: topic.id,
    topicTitle: topic.title,
    type: '名言警句',
    title: item.source,
    description: item.content,
    angle: item.angle,
  }
}

export function topicToLocalItems(topic: MaterialLibraryTopic): LocalMaterialItem[] {
  return [
    ...topic.peopleExamples.map((item) => exampleToLocalItem(topic, '人物事例', item)),
    ...topic.hotTopics.map((item) => exampleToLocalItem(topic, '时评热点', item)),
    ...topic.quotes.map((item) => quoteToLocalItem(topic, item)),
    ...topic.angles.map((angle, index) => ({
      id: `${topic.id}-angle-${index}`,
      topicId: topic.id,
      topicTitle: topic.title,
      type: '适用角度' as const,
      title: `角度 ${index + 1}`,
      description: angle,
      angle,
    })),
    {
      id: `${topic.id}-usage`,
      topicId: topic.id,
      topicTitle: topic.title,
      type: '使用示范',
      title: '素材使用示范',
      description: topic.usageExample,
      angle: topic.angles[0],
    },
  ]
}

export function searchMaterialLibrary(topic: MaterialLibraryTopic, query: string) {
  const trimmedQuery = query.trim()
  const items = topicToLocalItems(topic)

  if (!trimmedQuery) {
    return items
  }

  return items.filter((item) =>
    [item.topicTitle, item.type, item.title, item.description, item.angle || ''].some((value) => includesKeyword(value, trimmedQuery)),
  )
}

export function materialTopicToResult(topic: MaterialLibraryTopic): MaterialRecommendResult {
  return {
    peopleExamples: topic.peopleExamples.map((item) => ({
      name: item.title,
      description: item.description,
      angle: item.angle,
    })),
    hotTopics: topic.hotTopics.map((item) => ({
      title: item.title,
      description: item.description,
      angle: item.angle,
    })),
    quotes: topic.quotes.map((item) => ({
      content: item.content,
      description: `${item.source}｜${item.angle}`,
    })),
    usageExample: topic.usageExample,
    thinkingPrompts: [
      '这个素材是否能直接支撑你的中心论点？',
      '素材后是否有一句扣题分析？',
      '同一素材还能从哪个角度展开？',
    ],
  }
}

function scoreTopic(topic: MaterialLibraryTopic, input: string) {
  const query = input.toLowerCase()
  const keywords = topicMatchKeywords[topic.id] || []
  const fields = [
    topic.title,
    topic.description,
    ...topic.angles,
    ...topic.peopleExamples.flatMap((item) => [item.title, item.description, item.angle]),
    ...topic.hotTopics.flatMap((item) => [item.title, item.description, item.angle]),
  ]

  const keywordScore = keywords.reduce((score, keyword) => score + (query.includes(keyword.toLowerCase()) ? 6 : 0), 0)
  const fieldScore = fields.reduce((score, field) => score + (field && query.includes(field.toLowerCase()) ? 2 : 0), 0)

  return keywordScore + fieldScore
}

export function findBestMaterialTopic(input: string) {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return getMaterialLibraryTopic(defaultMaterialLibraryTopicId)
  }

  return [...materialLibrary].sort((a, b) => scoreTopic(b, trimmedInput) - scoreTopic(a, trimmedInput))[0]
}

export function localMaterialItemToText(item: LocalMaterialItem) {
  const angle = item.angle ? `适用角度：${item.angle}` : ''

  return [`【${item.topicTitle}｜${item.type}】${item.title}`, item.description, angle].filter(Boolean).join('\n')
}

function textFromResultItem(item: ResultTextItem | undefined) {
  if (!item) return ''
  if (typeof item === 'string') return item

  return [item.title || item.name || item.content, item.description || item.text || item.example, item.angle].filter(Boolean).join(' ')
}

export function getWorkflowMaterialSupplement(input: string, existing: ResultTextItem[] = [], limit = 3) {
  const existingText = existing.map(textFromResultItem).join(' ')
  const bestTopic = findBestMaterialTopic(input)

  return bestTopic.peopleExamples
    .map((item) => ({
      title: item.title,
      description: item.description,
      angle: item.angle,
    }))
    .filter((item) => !existingText.includes(item.title))
    .slice(0, Math.max(0, limit - existing.length))
}

export function supplementWorkflowMaterials(result: WritingWorkflowResult, input: string, minCount = 3): WritingWorkflowResult {
  const currentMaterials = Array.isArray(result.materials) ? result.materials : []

  if (currentMaterials.length >= minCount) {
    return result
  }

  const supplements = getWorkflowMaterialSupplement(input, currentMaterials, minCount)

  return {
    ...result,
    materials: [...currentMaterials, ...supplements],
  }
}

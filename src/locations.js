// Diagrammatic Blender-space coordinates derived from the plan. Not GIS coordinates.
const px = (x, y) => [(x - 620) * 0.22, (555 - y) * 0.22];

export const locations = [
  {
    id: 'library', number: '01', title: '行政与图书馆', en: 'Library & Administration',
    summary: '西侧校园地标。建筑围绕主入口广场与中轴步道展开。',
    plan: [277, 394], position: px(277, 394), category: 'building',
  },
  {
    id: 'academic', number: '02', title: '教学综合体', en: 'Academic Complex',
    summary: '校园中央的复合教学空间，衔接广场、步行系统和科研楼。',
    plan: [691, 454], position: px(691, 454), category: 'building',
  },
  {
    id: 'research', number: '03', title: '科研楼', en: 'Research Building',
    summary: '位于教学综合体东南侧的独立研究建筑。',
    plan: [787, 543], position: px(787, 543), category: 'building',
  },
  {
    id: 'residence', number: '04', title: '学生宿舍', en: 'Student Residences',
    summary: '北侧组团建筑，靠近自然绿地与校园内部环路。',
    plan: [839, 287], position: px(839, 287), category: 'building',
  },
  {
    id: 'field', number: '05', title: '运动场', en: 'Sports Field',
    summary: '教学组团与体育馆之间的开放式球场。',
    plan: [931, 494], position: px(931, 494), category: 'landscape',
  },
  {
    id: 'gym', number: '06', title: '体育馆', en: 'Gymnasium',
    summary: '东侧长跨室内体育建筑，紧邻运动场。',
    plan: [1079, 438], position: px(1079, 438), category: 'building',
  },
  {
    id: 'lake', number: '07', title: '校园湖', en: 'Campus Lake',
    summary: '横贯场地南侧的连续水系，构成滨水漫游的主体空间。',
    plan: [542, 801], position: px(542, 801), category: 'landscape',
  },
  {
    id: 'bridge', number: '08', title: '双孔石拱桥', en: 'Stone Arch Bridge',
    summary: '跨越湖面连接教学区与东南绿地的两孔石桥。可看到通透拱洞与石砌栏杆。',
    plan: [751, 714], position: px(751, 714), category: 'landscape',
  },
  {
    id: 'waterfront', number: '09', title: '滨水绿带', en: 'Waterfront Greenbelt',
    summary: '环湖步道、草坪与树阵组成的慢行绿廊。',
    plan: [938, 822], position: px(938, 822), category: 'landscape',
  },
  {
    id: 'north', number: '10', title: '北侧自然绿地', en: 'Northern Green Zone',
    summary: '总图最北侧的平坦绿化区域；模型未保留参考图之外的山体。',
    plan: [614, 188], position: px(614, 188), category: 'landscape',
  },
  {
    id: 'plaza', number: '11', title: '中心广场', en: 'Central Plaza',
    summary: '行政图书馆与教学区之间的步行集散空间。',
    plan: [520, 530], position: px(520, 530), category: 'landscape',
  },
  {
    id: 'entrance', number: '12', title: '校园主入口', en: 'Main Entrance',
    summary: '场地西南侧的主入口，与馆前广场相接。',
    plan: [111, 695], position: px(111, 695), category: 'landscape',
  },
];

export const locationById = new Map(locations.map((point) => [point.id, point]));

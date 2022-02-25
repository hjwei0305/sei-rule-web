export default [
  {
    path: '/user',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './Login' },
    ],
  },
  {
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', component: './Dashboard' },
      {
        path: '/rule',
        name: '规则',
        routes: [
          { path: '/rule/entityConfig', name: '规则主体', component: './RuleEntity' },
          { path: '/rule/definition', name: '规则定义', component: './RuleDefinition' },
          { path: '/rule/initialization', name: '应用初始化', component: './Initialization' },
        ],
      },
    ],
  },
];

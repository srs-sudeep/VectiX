import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Models',
      items: [
        'models/intro',
        {
          type: 'category',
          label: 'RBAC Models',
          items: [
            'models/rbac/user',
            'models/rbac/role',
            'models/rbac/permission',
            'models/rbac/module',
            'models/rbac/route',
          ],
        },
        {
          type: 'category',
          label: 'Personal Finance Models',
          items: [
            'models/finance/account',
            'models/finance/transaction',
            'models/finance/category',
            'models/finance/subscription',
            'models/finance/attachment',
          ],
        },
        {
          type: 'category',
          label: 'Splitwise Models',
          items: [
            'models/splitwise/group',
            'models/splitwise/group-member',
            'models/splitwise/group-expense',
            'models/splitwise/expense-split',
            'models/splitwise/settlement',
          ],
        },
      ],
    },
  ],
};

export default sidebars;

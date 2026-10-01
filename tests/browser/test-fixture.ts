import {test as base} from '@playwright/test';
// Existing regression scenarios intentionally leave/reload documents. New
// safeguard tests explicitly replace this handler to exercise cancellation.
export const test=base.extend({page:async({page},use)=>{page.on('dialog',dialog=>void dialog.accept());await use(page);}});
export {expect,type Page} from '@playwright/test';

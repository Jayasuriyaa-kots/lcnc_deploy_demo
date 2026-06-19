# Deployment Page Selector Plan

## What I understood

The deployed desktop layout should support this navigation hierarchy:

```text
Primary Page
  -> Left Page
    -> Subpages
      -> Top Pages
```

The current builder already has:

- Primary Page Selector: the root vertical/icon navigation.
- Left Page Selector: currently depends on the selected primary page.
- Top Page Selector: can depend either on the left selector or the primary selector.
- Preview modal: shows the deployed layout, but it is currently constrained inside a modal-sized preview area.

The missing piece is the subpage layer under left pages. In the desired behavior, a left page can have its own subpages, and those subpages can then drive the top pages. Top pages should still be flexible:

- If Top Page Selector depends on the left page path, top tabs should follow the selected left subpage when subpages exist.
- If Top Page Selector depends on the primary page, top tabs should follow the selected primary page directly.
- If a left page has no subpages, it should still be able to behave like a direct page or direct top-page source.

## Existing code shape

The main files involved are:

- `apps/builder/src/app/features/deployment/containers/deployment-page.component.ts`
- `apps/builder/src/app/features/deployment/containers/deployment-page.component.html`
- `apps/builder/src/app/features/deployment/containers/deployment-page.component.scss`

Important existing state:

- `primaryPages`: root pages.
- `leftSubPagesByPrimaryId`: currently stores left selector children under primary pages.
- `topTabPagesBySourceId`: stores top tab pages by dependency source id.
- `topDependencySource`: chooses whether top tabs depend on `left` or `primary`.
- `previewNavigationPages`, `previewSubPages`, `previewTopTabs`: compute preview navigation state.

## Changes I am going to make

1. Rename/clarify the hierarchy in code and UI so the left selector represents left pages, and each left page can have child subpages.

2. Add a subpage collection under each left page, so the builder can configure:

   ```text
   Primary Page -> Left Page -> Subpage
   ```

3. Update the Top Page Selector source list:

   - When dependency is `Left Page Selector`, top-page groups should be created from left subpages when present.
   - If a left page does not have subpages, the left page itself can still appear as a top-page source.
   - When dependency is `Primary Page Selector`, top-page groups should continue to come from primary pages.

4. Update the generated layout JSON to include the extra subpage level under the left selector, while keeping `topPageSelector.dependsOn` as either:

   - `left_page_selector`
   - `primary_page_selector`

5. Update preview interaction:

   - Selecting a primary page shows its left pages.
   - Selecting a left page shows its subpages if configured.
   - Selecting a subpage drives top tabs when top pages depend on the left hierarchy.
   - Selecting a primary page drives top tabs when top pages depend on primary.

6. Add full-screen preview support:

   - Keep the current modal preview option.
   - Add a full-screen preview mode/class so the app layout can use the available viewport width and height.
   - Keep generated JSON accessible, but avoid it shrinking the visual preview when full-screen mode is active.

7. Preserve existing add, rename, remove, and reorder behavior where possible, extending it to the new subpage layer instead of replacing the whole screen.

## Acceptance check

- Builder can configure primary pages, left pages, subpages, and top pages.
- Top pages can depend on either left/subpage path or primary page.
- Preview reflects the selected hierarchy correctly.
- Preview can be expanded to full screen.
- Existing direct-primary behavior still works when other page selectors are disabled.

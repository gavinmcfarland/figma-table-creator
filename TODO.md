# Todo

1. Check properly for template component when searching DONE?
2. Update settings page / Add ability to swap templates
3. Fix copy and paste of corner radius
4. Set as default when import template DONE
5. Create component if template from same file DONE
6. Develope script to migrate users of old plugin to new version
7. Add onboarding screens
---
8. Add option to export as obj to Node Decoder
9. Fix autolayout problems
10. Add option to delete template from UI
11. When no local templates but remote templates set default template to remote
12. Add some form of carosel to UI https://github.com/beyonk-adventures/svelte-carousel/blob/master/src/Carousel.svelte
13. How to speed up table creation
14. Add error if table template can't be found when creating table
15. Add an import info screen (only shows once?)
16. Customise shortcut depending on platform `window.navigator.platform`

1. Style welcome pages. Add artwork images and position to bottom of the frame (DONE)
2. Find out why clicking existing template doesn't work
3. Fix remoteFiles being an empty array


---

1. Add check to see if table is the main template before detaching and using column resizing
2. Width doesn't work when creating a table
3. Fix new template to be an invrement of previous template
3. Make modifications to default template
4. Update name of all local templates when plugin runs
5. Add edit icon to list of local templates DONE

1. Change editTemplates file to list or array or see if you can loop object in Svelte.
2. Highlight currently selected element in list if it exists
3. Show grey line if nothing currently selected
4. Don't show button if nothing selected
5. If nothing is selected, don't show elements? NO

1. Don't rely on component + table to idenitify template. Use component and template. DONE
2. BUG: Restrict the selection to the template currently being edited DONE
3. BUG: Template not selected after selecting and then opening menu again
4. Check using remote files works DONE
5. Fix tableSettings calculation based on parent of row
6. Add checks for relaunch buttons being applied on component
7. Add list of remote files UI DONE
8. Add bold to header in default components
9. Make sure select columns and rows data is added to cells
10. detect when table template is using columns or rows
11. Add back button to choosing file page




1. When editing template which is on a different page the plugin doesn't change page DONE
2. Toggling from cols to rows doesn't work when not the same number of columns and rows DONE
3. Toggling localised component loses text DONE
4. Add bold font weight to header component DONE
5. Change row to column to select all children of parent rather than just nodes marked with tr DONE

1. Disable converting component template from rows to columns for now

---

1. Update to dark/light UI (ALMOST DONE)
2. Script to migrate existing tables to sync to new template (DONE)
3. Sync recent files, set default template (DONE)
4. Fix post current selection (DONE)
5. Fix add/remove element in UI (DONE)
6. Import component if remote
7. Set default template when components converted to template (DONE)
8. Fix bug where defaultTemplate is undefined in UI after creating new template (DONE)
9. Local templates not showing when first converting template (DONE)
10. Create new artwork for dark and light themes (DONE)
11. Create artwork for update components
12. Make it so templates get created based on the canvas colour DONE
13. BUG Column height fixed when switching to columns
14. BUG See if base component is causing sluggish-ness in resizing columns
15. Redesign new template and instructions DONE
16. Create upgraded template tooltip DONE
17. Add remote files functions from library DONE
18. Fix image in editing template for light and dark DONE
19. Failsafe if parts of template aren't defined

---

1. Add relaunch data to open table plugin DONE
2. Check relaunch buttons DONE
3. Enable importing DONE
4. Decide whether to publish cell/row or not
5. A way to maintain files (delete them when data doesn't exist)
    1. Automatically delete file when no fileData found
    2. Escape hatch for when someone duplicates a file
    3. Don't add file to list unless component published, then remove when can't be imported
    4. Some way to expire recent files over time
6. Change the way remote files work, to add them manually DONE
7. Do I need a way to remove remote files, or templates?
8. Crazy idea, store a version of the imported table template inside the newly created table, hidden, so that when updates are published, you get a reminder?
9. Add option to create a new template from plugin DONE
10. Options to taylor how new template is created DONE
11. Need to reset current file selected in UI when table is local table is deleted so that previously selected table is used
12. Option to delete template from UI DONE
13. BUG: Fixed zoome and center selection DONE
14. Decied between "Table" or "Template" for name of template component DONE
15. Redesign icon DONE
16. What to do if defaultTemplate doesn't exist but there are templates DONE
17. Add ability to add existing template
18. BUG: Weird bug when 8 rows selected TEMP_FIX
19. Customise difference between first time creating template and second time creating template?
22. Should remove button be at the end or right click?


1. Put a timestamp on recent files so that I can delete them after X time and order by most recently visited, created?
2. BUG: When first run the plugin in another file and shoose remote file it doesn't show the remote file in the dropdown FIXED
3. Disable option to delete templates DONE
4. Enable option to delete remote file DONE
5. Ability to add a new file DONE

20. Add option to navigate back on welcome screens DONE
21. Add dots on welcome screens DONE

---

1. Should tables be created in a new page. Should they be selected. Should it change page if a new page is created?
2. Check updrading files
3. Update artwork color pink. DONE
4. BUG: rows do not fill parent when created DONE
5. BUG: When turning localised component off. Component does not respect fill-parent DONE
6. BUG: template needs rows set to fill parent DONE
7. Don't create table if all parts missing DONE
8. BUG: When plugin run, it seems to change template width from hug to fixed FIXED

---

1. Regresion test editing templates (What can go wrong?)
2. Regression test deleting templates DONE
3. Regression test first use DONE
4. Regression test upgrade template (3 variants) DONE
5. Regression test dark and light DONE
6. Update artwork DONE
7. Remove console.logs DONE
8. Regression test importing DONE
9. Improve whats new when opening on file that already has templates DONE

1. Automatically detach table and rows when using column or rows DONE
2. Add .row to table instances so they don't get published dONE
3. Disable column sizing and row/column on component DONE




I think this appears when trying to import from same file:
Cannot import component with key "d77030703f0f63fd564aeb19d7eecda54dd91505" since it is unpublished

'Could not find a published component with the key'


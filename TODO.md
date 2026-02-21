# TODO - Fix vertical scrolling on smaller phones

## Task: Fix profile page and chat page layouts to allow vertical scrolling on smaller phones

### Files to Edit:
- [ ] frontend/src/pages/tenant/Profile.jsx - Add min-h-0 and overflow-y-auto
- [ ] frontend/src/pages/landlord/Profile.jsx - Add min-h-0 and overflow-y-auto
- [ ] frontend/src/pages/tenant/Chat.jsx - Fix layout with negative margins
- [ ] frontend/src/pages/landlord/Chat.jsx - Fix layout with negative margins

### Changes Required:
1. Profile pages: Add `min-h-0` and `overflow-y-auto` to the main container to allow vertical scrolling within the flex container
2. Chat pages: Remove the problematic negative margins (`-m-4`) and adjust the layout to work properly with the bottom navigation

// Static local preference initialization. No user content is interpolated.
export const themeScript =
  'try{var t=localStorage.getItem("ciscoku:theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}';

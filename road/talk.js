/* Helen's Road, the Philadelphia workshop (talk.html): the slides about me before the road, and my own speaker notes.
   Read by road.js (the slides) and by notes.html (the notes window and the printed script).
   Sam: change any words here. The notes for each stop already show what the recordings say and which records are on
   screen; "say" is for what I add live, after the recording, before I click on. Leave it '' to add nothing. */
window.TALK = {
  who: [
    { img: 'road/img/road/sam-wedding-2025.jpg', cap: 'Hawaii, December 2025', h: 'Samantha Seligman-Grajewski', p: ['Engineering Remembrance', 'In this photo I’m holding onto something you can’t see. That’s how this research feels: so close. What is there?'],
      say: 'Hello, and thank you for coming. I’m Samantha Seligman-Grajewski. This is my wedding day in Hawaii, last December. Look at my hand: I’m holding onto something, my husband, but you can’t see him. That’s how this whole research journey feels to me. So close, but what is there? That’s the mystery.' },
    { img: 'road/img/helen-sam-2010.jpg', cap: 'Helen and me, 2010', h: 'Why I do this',
      p: ['Both of my grandparents survived the Holocaust: Helen Landó Helmán and Tibi Katz.',
          'When I was born, Helen retired and lived with us part of every week to help raise me. I was the youngest, and she slept in my bed with me.'],
      say: 'This is personal. Both of my grandparents survived. Helen helped raise me: she lived with us part of every week, and she slept in my bed with me.' },
    { img: 'road/img/road/sam-wedding-2025.jpg', cap: 'Hawaii, December 2025', h: 'How I do this',
      p: ['I research from Hawaii, the other side of the world from her hometown.',
          'I speak only English. AI helps me read the records; I check every one against the original.',
          'I was never trained in this. If I can learn it, you can too.'],
      say: 'I want you to leave thinking you can do this too. I do it from Hawaii, in English only, with AI to help me read, and I check every record myself. Today I’ll use my grandmother’s road as the case study.' }
  ],
  // what I add live at each stop, after the recording (by stop id)
  say: {
    europe: '', birth: '', david: '', keleti: '', kiraly: '', family: '', buchenwald: '', magdeburg: '', rehmsdorf: '',
    buda: '', reitzenhain: '', terezin: '', budapest45: '', indersdorf: '', prien: '', bremen: '', america: '',
    reunited: '', museum: '', hawaii: ''
  },
  here: 'Thank you. The QR code goes to engineeringremembrance.org: the free guide, the databases, and Helen’s Road to watch again. Start with one name and one town.'
};

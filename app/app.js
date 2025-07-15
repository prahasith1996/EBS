var Data = {
  progress: 0,
  selected: null,
  score: 0,
  question: {
    current: [],
    fetch: function() {
			m.request({
				method: "GET",
				url: "/question",
			})
			.then(function(res) {
				Data.question.current = res.question;
        Data.progress = res.progress;
        Data.score = res.score;
        Data.selected = null;
        console.log("refresh")
        m.redraw();
			})
		}
  }
}

var Choice = {
  click: function(n){
    return function(){
      Data.selected = n
    }
  },
  classes: function(n){
    if (Data.selected === n){
      return 'active'
    } else {
      return ''
    }
  },
  view: function(vnode){
    var n = vnode.attrs.option
    return m('.choice',{ class: Choice.classes(n), onclick: Choice.click(n) },
      m('span.l'),
      m('span.v',Data.question.current?.[0]?.['option_'+n])
    )
  }
}

var ProgressBar = {
  view: function() {
    return m('.progress-container', [
      m('.progress-bar', [
        m('.progress-fill', {
          style: {
            width: Data.progress + '%'
          }
        })
      ]),
      m('.progress-text', Data.progress  + '%')
    ]);
  }
};

var ScoreCard = {
  view: function() {
    const score = parseInt(Data.score);
    let scoreColor = '';

    if (score < 50) {
      scoreColor = 'red';
    } else if (score < 80) {
      scoreColor = 'orange';
    } else {
      scoreColor = 'green';
    }
    return m('article', [
          m('h2', {class: "score", style: {color: scoreColor}}, `${score}%`),
          m('h2', {style: {textAlign: "center"}}, 'Your Score'),
          m('.reset', m("button", {onclick: App.reset}, 'Reset'))
    ]);
  }
};

var App = {
  oninit: Data.question.fetch,
  view: function() {
    const isCompleted = Data.progress === "100";
    return m('main', [
      m("h1",{class: 'quiz-title'}, isCompleted? "QUIZ COMPLETED" : "AWS QUIZ"),
      isCompleted? m(ScoreCard)
      : m('article',
        m(ProgressBar),
        m('h2','Question:'),
        m('.question',Data.question.current?.[0]?.question),
        m(Choice,{option: 'a'}),
        m(Choice,{option: 'b'}),
        m(Choice,{option: 'c'}),
        m(Choice,{option: 'd'}),
        m('.submit', m("button", {onclick: App.submit, disabled: !Data.selected}, 'Submit'))
      )
    ])
  },
    submit: function(){
    m.request({
        method: "PUT",
        url: "/submit",
        body: {choice: Data.selected, question_uuid: Data.question.current?.[0]?.uuid},
    })
    .then(function(res) {
    console.log("Answer submitted!");
    Data.question.fetch();
  }).catch(function(error) {
    console.log("Error in submission:", error);
  });
  },
    reset: function(){
    m.request({
        method: "DELETE",
        url: "/reset"
    })
    .then(function(res) {
    console.log("Questions reset!");
    Data.question.fetch();
  }).catch(function(error) {
    console.log("Error in reset:", error);
  });
  }
}

m.mount(document.body, App)

const domReady = require('domready');
import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import './stylesheets/main.css';
import totalHealthcare from './totalHealthcare';
import Employer from './Employer';
import Medicare from './Medicare';


domReady(() => {
  Promise.all([
  csv('./data/bivariate.csv'),
  json('./data/article.json'),
]).then(d => {
  const [data, article] = d;
  app(data, article);
});

});



const slideChartTypeMap = {
  0: totalHealthcare,
  1: Employer,
  2: Medicare,
};

const InsuranceType = {
  0: "Total Healthcare",
  1: "Employer",
  2: "Medicare",
};


function app(data, article) {
  const state = {slideIdx: 0};
  console.log(data);

  const buttons = select('.buttons-container')
    .selectAll('button')
    .data([0, 1, 2])
    .enter()
    .append('button')
    .text(function(d){return InsuranceType[d];})
    .on('click', d => {
      state.slideIdx = d;
      render();
      console.log(InsuranceType[d]);
    });

  function render() {
    buttons
      .style('font-weight', d => {
        return d === state.slideIdx ? 'bolder' : 'normal';
      });

    // remove old contents
    select('.sidebar *').remove();
    select('.main-area *').remove();
    // start doing stuff
    if (state.slideIdx > 0) {
      select('.main-area')
        .append('h1');
    }

    select('.sidebar').text(article[state.slideIdx]);
    if (slideChartTypeMap[state.slideIdx]) {
      slideChartTypeMap[state.slideIdx](data);
    } else {
      // TODO add a "you screwed up comment/view/whatever"
    }
  }
  
  
  render();
}

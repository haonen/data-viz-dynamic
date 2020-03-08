const domReady = require('domready');
import {select} from 'd3-selection';
import {csv, json} from 'd3-fetch';
import './stylesheets/main.css';
import totalHealthcare from './totalHealthcare';
import Employer from './Employer';
import Medicare from './Medicare';


domReady(() => {
  csv('./data/bivariate_2014.csv').then(d => app(d));

});

const slideChartTypeMap = {
  0: totalHealthcare,
  1: Employer,
  2: Medicare,
};


function app(data) {
  const state = {slideIdx: 0};
  console.log(data);

  const buttons = select('.buttons-container')
    .selectAll('button')
    .data([0, 1, 2])
    .enter()
    .append('button')
    .text(d => d)
    .on('click', d => {
      state.slideIdx = d;
      render();
      console.log(d);
    });

  function render() {
    buttons
      .style('font-weight', d => {
        return d === state.slideIdx ? 'bolder' : 'normal';
      })
      .text(d => {
        return d === state.slideIdx ? `SELECTED SLIDE ${d}` : state.slideIdx;
      });
    // remove old contents
    select('.sidebar *').remove();
    select('.main-area *').remove();
    // start doing stuff
    if (state.slideIdx > 0) {
      select('.main-area')
        .append('h1');
    }

    //select('.sidebar').text(article[state.slideIdx]);
    if (slideChartTypeMap[state.slideIdx]) {
      slideChartTypeMap[state.slideIdx](data);
    } else {
      // TODO add a "you screwed up comment/view/whatever"
    }
  }
  
  
  render();

  // setInterval(() => {
  //   state.slideIdx = (state.slideIdx + 1) % 3;
  //   render();
  // }, 5000);
}

import React from 'react';

export function addLineBreaks(values: string | string[]) {
  if(typeof values === 'string') {
    values = values.split('\n');
  }
  
  return values.map((text, index) => (
    <React.Fragment key={index}>
      {text}
      {index < values.length -1 && (
        <br />
      )}
    </React.Fragment>
  ));
}

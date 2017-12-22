function execCommandOnElement(el, commandName, valueGiven) {
  let value = valueGiven;

  if (typeof value === 'undefined') {
    value = null;
  }

  if (typeof window.getSelection !== 'undefined') {
    // Non-IE case
    let sel = window.getSelection();

    // Save the current selection
    const savedRanges = [];
    for (let i = 0, len = sel.rangeCount; i < len; ++i) {
      savedRanges[i] = sel.getRangeAt(i).cloneRange();
    }

    // Temporarily enable designMode so that
    // document.execCommand() will work
    document.designMode = 'on';

    // Select the element's content
    sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);

    // Execute the command
    document.execCommand(commandName, false, value);

    // Disable designMode
    document.designMode = 'off';

    // Restore the previous selection
    sel = window.getSelection();
    sel.removeAllRanges();
    for (let j = 0, len2 = savedRanges.length; j < len2; ++j) {
      sel.addRange(savedRanges[j]);
    }
  } else if (typeof document.body['createTextRange'] !== 'undefined') {
    // IE case
    const textRange = document.body['createTextRange']();
    textRange.moveToElementText(el);
    textRange.execCommand(commandName, false, value);
  }
}

export default execCommandOnElement;
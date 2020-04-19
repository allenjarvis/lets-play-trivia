// This script will create resources to facilitate a virtual Team Trivia game:

// 1. An answer form to be used by the participants.

// 2. A spreadsheet of the submitted answers. This Sheet has a column where you can score each answer, 
// and it has a tab where you can see an up-to-date scoreboard for all teams. 

// 3. A spreadsheet for you to populate with questions as the game progresses.

// 4. An HTML file (from a template) that provides instructions and links for the players and quizmaster.


function doGet(e) {
  
  // Name the game
  var game_id = Date.now();
  if(typeof e.parameter.name === 'undefined') {
      var name = 'Team Trivia';
  } else {
      var name = e.parameter.name + "'s Trivia";
  }
  

  // Create a new form...  
  // Make an initial list of teams here (you CAN change this after the Form is created)
  var teams = [
    'Team 1',
    'Team 2',
    'Team 3'
  ];
  var form = FormApp.create(name + ' (Game ID: ' + game_id + ')');
  form.setDescription('Game ID: ' + game_id)
  form.addMultipleChoiceItem()
      .setTitle('What is your team?')
      .setChoiceValues(teams)
      .setRequired(true)
      .showOtherOption(false);
  form.addParagraphTextItem()
      .setTitle('What point value are you using/betting?');
  form.addParagraphTextItem()
      .setTitle('What is the answer!?');
  
  
  // Create a spreadsheet for the form responses (the answers)
  var ss1 = SpreadsheetApp.create('ANSWERS: ' + name + ' (Game ID: ' + game_id + ')');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss1.getId());
  // Add a column for Points Earned
  var ss1a = ss1.getSheetByName('Form Responses 1');
  ss1a.getRange('E1').setValue('Points Earned');
  // Make it look pretty
  ss1a.setColumnWidths(1, 2, 150)
    .setColumnWidth(3, 300)
    .setColumnWidth(4, 400)
    .setColumnWidth(5, 150);
  // set wrapping strategy
  var range_a = ss1a.getRange("A:E");
  range_a.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  //create a pivot table for the scoreboard (using range from wrapping strategy above)
  var ss1b = ss1.getSheetByName('Sheet1');
  ss1b.setName("Scoreboard")
    .setColumnWidths(1, 2, 150);
  var range_b = ss1b.getRange("A:C");
  var pivot = range_b.createPivotTable(range_a);
  pivot.addRowGroup(2);
  pivot.addPivotValue(5, SpreadsheetApp.PivotTableSummarizeFunction.SUM);  

  
  // Create a spreadsheet for the questions
  var ss2 = SpreadsheetApp.create('QUESTIONS: ' + name + ' (Game ID: ' + game_id + ')');
  // Add a column for Points Earned
  var ss2a = ss2.getSheetByName('Sheet1');
  ss2a.setName("QUESTIONS");
  ss2a.getRange('A1:D1').setValues([['Round','Category','Question','Correct Answer']]);
  // Make it look pretty
  ss2a.setColumnWidth(1, 100)
    .setColumnWidth(2, 150)
    .setColumnWidth(3, 600)
    .setColumnWidth(4, 300)
    .setFrozenRows(1);
  // set wrapping strategy
  var range = ss2a.getRange("A:D");
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
  // open up public VIEW access
  var file = DriveApp.getFileById(ss2.getId());
  file.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  
  // Add collaborator
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(e.parameter.collaborator)) {
    var collaborator = e.parameter.collaborator;
    // form
    var file = DriveApp.getFileById(form.getId());
    file.addEditor(collaborator);      
    // form responses/scoreboard
    var file = DriveApp.getFileById(ss1.getId());
    file.addEditor(collaborator);    
    // questions
    var file = DriveApp.getFileById(ss2.getId());
    file.addEditor(collaborator); 
  } else {
    var collaborator = "None or invalid";
  }


  // create an HTML file and return it
  var HTMLOutput = HtmlService.createTemplateFromFile('index');
  HTMLOutput.name = name;
  HTMLOutput.game_id = game_id;
  HTMLOutput.form = form.getPublishedUrl();
  HTMLOutput.form_edit = form.getEditUrl();
  HTMLOutput.answers = ss1.getUrl();
  HTMLOutput.questions = ss2.getUrl();
  HTMLOutput.collaborator = collaborator;
  return HTMLOutput.evaluate();

  
  // Output info about what you created
  Logger.log('form: ' + form.getPublishedUrl());  
  Logger.log('form edit: ' + form.getEditUrl());  
  Logger.log('answers: ' + ss1.getUrl());
  Logger.log('questions: ' + ss2.getUrl());

}

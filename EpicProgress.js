var releaseDropdown = null;
var rallyDataSource = null;
var busySpinner = null;
var storyName = {};   // purposeful global, for use in showTooltip
var acceptedStates = ["Accepted"];   // And user could have one more post-Accepted state

//-----------------------------------------------------------------------------------

function findParentPosX(obj) {
    var curleft = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curleft += obj.offsetLeft;
            obj = obj.offsetParent;
        }
    }
    else if (obj.x) {
        curleft += obj.x;
    }
    return curleft;
}


function findParentPosY(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        while (obj.offsetParent) {
            curtop += obj.offsetTop;
            obj = obj.offsetParent;
        }
    }
    else if (obj.y) {
        curtop += obj.y;
    }
    return curtop;
}


function showTooltip(tooltipId, parentId, posX, posY) {
    // show the tooltip contents in the DIV tooltipId relative to the parentID element
    // at posX, posY from the upper left corner of the parentID element

    tt = document.getElementById(tooltipId);
    var tooltipText = storyName[parentId];  // parentId value is the story.FormattedID
    if (tooltipText.length > 80) {
        tooltipText = tooltipText.substring(0, 80) + ' ...';
    }
    tt.innerHTML = tooltipText;

    parentElement = document.getElementById(parentId);
    parentElement.style.cursor = "default";

    // overcome deficiency in MSIE in setting default tooltip size
    if ((tt.style.top === '' || tt.style.top === 0) &&
            (tt.style.left === '' || tt.style.left === 0)) {
        if (tt.offsetWidth < 200) {
            tt.style.width = 200 + 'px';
        }
        else {
            tt.style.width = tt.offsetWidth + 'px';
        }
        tt.style.width = "260px";
        tt.style.height = tt.offsetHeight + 'px';
    }
    tt.style.height = "32px";
    var ttw = tt.style.width;
    var tth = tt.style.height;

    // if tooltip is too wide, shift left to be within parent
    if (posX + tt.offsetWidth > parentElement.offsetWidth) {
        posX = parentElement.offsetWidth - tt.offsetWidth;
    }
    if (posX < 0) {
        posX = 0;
    }

    var pposY = findParentPosY(parentElement);
    var pposX = findParentPosX(parentElement);
    y = pposY + posY + parentElement.offsetHeight;  // moves y location above (-) or below (+) parent element (+/- posY)
    x = pposX - parentElement.offsetWidth + posX;   // moves x location left (-) or right (+) by width of parent element (+/- posX)

    //x = pposX +  parentElement.offsetWidth -2;    // moves x location to just right of parent element
    //y = pposY + (parentElement.offsetHeight/5);   // moves y location down 1/5 of the height of the parent element

    tt.style.top = y + 'px';
    tt.style.left = x + 'px';

    tt.style.display = 'block';
    tt.style.visibility = 'visible';
}


function hideTooltip(tooltipId, parentId) {
    parentElement = document.getElementById(parentId);
    parentElement.style.cursor = "default";
    tt = document.getElementById(tooltipId);
    tt.innerHTML = "";
    tt.style.visibility = 'hidden';
    tt.style.display = 'none';
}


//-----------------------------------------------------------------------------------

function clearTable(table) {
    var rowCount = table.rows.length;

    if (rowCount > 0) {
        for (var i = (rowCount - 1); i >= 0; i--) {
            table.deleteRow(i);
        }
    }
}

//-----------------------------------------------------------------------------------

function prepFeedback() {
    table = document.getElementById("efp_table");  // epic family progress table
    clearTable(table);
    tbody = document.getElementById("efpt_body");
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    tbody.appendChild(row);
    row.appendChild(cell);
    cell.setAttribute("id", "feedback");
    cell.setAttribute("style", "border: none;");
    cell.innerHTML = "No User Stories were in iterations defined in the time period for the selected release.";
}

function getRallyDate(jsDate) {
    var yr = jsDate.getUTCFullYear();
    var mon = ("0" + (jsDate.getUTCMonth() + 1));
    var day = ("0" + jsDate.getUTCDate()).substr(-2);
    var hr = ("0" + jsDate.getUTCHours()).substr(-2);
    var min = ("0" + jsDate.getUTCMinutes()).substr(-2);
    var sec = ("0" + jsDate.getUTCSeconds()).substr(-2);

    // YYYY-mm-ddTHH:MM:SS
    return       yr +
            "-" + mon.substr(mon.length - 2, 2) +
            "-" + day.substr(day.length - 2, 2) +
            "T" + hr + ":" + min + ":" + sec;
}

//-----------------------------------------------------------------------------------


function manufactureTableColumnHeaders(table, iterations) {
    /*
     // get the "efpt_tbody" element, add a row with:
     // header cell: blank (for Epics), header cell No Iteration,
     // and a header cell for each iteration in iterations
     */
    tbod = document.getElementById("efpt_body");
    headerRow = document.createElement("tr");
    tbod.appendChild(headerRow);
    epicColumn = document.createElement("th");
    headerRow.appendChild(epicColumn);
    epicColumn.setAttribute("id", "EpicStory");

    for (var it = 0; it < iterations.length; it++) {
        iter = iterations[it];
        endDate = iter.EndDate;
        endDate = iter.EndDate !== 'None' ? iter.EndDate.replace(/T.*$/, "") : 'None';
        // create the new column header, add it to the parent DOM element (headerRow),
        // then you can manipulate the innards (attributes, innerHTML)
        colHdr = document.createElement("th");
        headerRow.appendChild(colHdr);
        colHdr.setAttribute("id", "it_" + endDate);
        colHdr.innerHTML = iter.Name;
    }
}

function storyWasAccepted(story) {
    var result = dojo.filter(acceptedStates,
            function (acc) {
                if (story.ScheduleState === acc) {
                    return true;
                }
            }
    );
    return (result.length > 0);
}

//-----------------------------------------------------------------------------------

function createStoryCard(story, today) {
    var MOUSEOVER = "onmouseover=\"showTooltip('story_tooltip', '_STORY_ID_', 0,-98);\"";
    var MOUSEOUT = "onmouseout=\"hideTooltip('story_tooltip', '_STORY_ID_');\"";
    var TOOLTIP_BEHAVIOR = MOUSEOVER + " " + MOUSEOUT;
    var storyUrl = '__SERVER_URL__/detail/ar/_OID_'.replace('_OID_', story.ObjectID);

    var card = '<div class="story_card _SCHED_STATE_" id="_STORY_ID_" _TOOLTIP_> \n' +
            '    <div class="story_text"><a href="_STORY_URL_" target="_new">_BOLD_STORY_ID_</a></div>\n' +
            '    <div class="story_name">_STORY_NAME_</div>                   \n' +
            '    <div class="story_ID">_STORY_OID_</div>                      \n' +
            '    <div class="story_points">_STORY_POINTS_</div>               \n' +
            '    <div class="estimate_bar">_STORY_PROGRESS_</div>             \n' +
            '</div>\n';

    var storyEnd = "none";
    var storyStart = "none";
    if (story.Iteration !== null) {
        storyEnd = story.Iteration.EndDate.replace(/T.*$/, "");
        storyStart = story.Iteration.StartDate.replace(/T.*$/, "");
    }

    var progressBar = '<div class="progress_bar" style="height: 100%;width: _PROGRESS_PCTG_">&nbsp;</div>';

    var progress = 0;
    if (( story.TaskEstimateTotal > 0 ) && ( story.TaskEstimateTotal >= story.TaskRemainingTotal )) {
        progress = ( story.TaskEstimateTotal - story.TaskRemainingTotal ) / story.TaskEstimateTotal;
    }

    progress = (progress * 100) + "%";
    if (progress != "0%") {
        progressBar = progressBar.replace('_PROGRESS_PCTG_', progress);
    }
    else {
        progressBar = "";
    }

    var points = 'X';   // default
    if (story.PlanEstimate !== null) {
        points = story.PlanEstimate + "";
    }
    var schedState = "on-track";  // prime to happy-path...
    if ((! storyWasAccepted(story) ) && ( storyEnd < today ))
    //if ( ( story.ScheduleState != "Accepted" ) &&  ( storyEnd < today ) )
    {
        schedState = "blocked";
    }

    if (story.Blocked) {
        schedState = "blocked";
    }
    else {
        if (storyWasAccepted(story))
        //if ( story.ScheduleState == "Accepted" )
        {
            schedState = "accepted";
        }
        else if (( storyEnd > today ) && ( storyStart < today )) {
            schedState = "on-track";
        }
        else if (storyStart > today) {
            schedState = "future";
        }
    }

    var tooltipTrigger = TOOLTIP_BEHAVIOR.replace('_STORY_ID_', story.FormattedID);
    tooltipTrigger = tooltipTrigger.replace('_STORY_ID_', story.FormattedID);  // there's two of them...
    card = card.replace('_TOOLTIP_', tooltipTrigger);
    card = card.replace('_STORY_URL_', storyUrl);
    card = card.replace('_STORY_URL_', storyUrl);
    card = card.replace('_STORY_ID_', story.FormattedID);
    card = card.replace('_BOLD_STORY_ID_', story.FormattedID);
    card = card.replace('_STORY_NAME_', story.Name);
    card = card.replace('_STORY_OID_', story.ObjectID);
    card = card.replace('_STORY_POINTS_', points);
    card = card.replace('_SCHED_STATE_', schedState);
    card = card.replace('_STORY_PROGRESS_', progressBar);
    return card;
}

//-----------------------------------------------------------------------------------

function showEmptyEpics(table, verbiage) {
    prepFeedback();
    var feedbackCell = document.getElementById("feedback");
    feedbackCell.setAttribute("style", "border: none;");
    feedbackCell.innerHTML = verbiage;
}

//-----------------------------------------------------------------------------------

function countNoParentStoriesInRelease(nop, iterations) {
    var inRlsCount = 0;
    var iterName = "";
    for (var i = 0; i < iterations.length; i++) {
        iterName = iterations[i];
        inRlsCount += nop[iterName].length;
    }

    return inRlsCount;
}



function byStoryFormattedID(a, b) {
    var a_num = parseInt(a.substring(1, a.length), 10);
    var b_num = parseInt(b.substring(1, b.length), 10);
    return a_num - b_num;
}

function itemInContainer(item, container) {
    var present = false;
    var ix = 0;
    for (ix = 0; ix < container.length; ix++) {
        if (container[ix] === item) {
            present = true;
            break;
        }
    }
    return present;
}


function organizeResults(results) {
    // Be aware that the level* items in results are symmetric and parallel
    // in that the record at index 4 in level3 is in fact related to the record
    // at index 4 in level2. For this example, the record in level3 is the parent
    // of the user story in level2.  This makes lining up the parent-child chain
    // incredibly easy, eg level[x] is parent of level[x-1] is parent of level[x-2] ...
    // As we will only ever display the ultimate epic (story with no parent) and
    // a leaf story (a story with no children), all we have to do to is to derive
    // a family chain at an index producing a family_chain Array whose item at
    // index 0 is the leaf story and the last non-null story in the chain is the ultimate
    // epic story.
    var level = [results.level1, results.level2, results.level3, results.level4, results.level5];

    // we also have to account for items in level1 that have no parent, these stories
    // get plunked into a separate 'No Parent' category.

    var iterations = [
        {Name: 'No Iteration', StartDate: 'None', EndDate: 'None'}
    ];
    var iterDict = {}; // a temp bucket to prevent us from adding dups to iterations based on Iteration.Name
    var iterName = ""; // a temp bucket for the iteration name
    //  'noParent' dict, keyed by Story.Iteration.Name with a list for each key
    var noParent = {'No Iteration' : []};
    var orphans = 0;
    for (var i = 0; i < results.iterations.length; i++) {
        iter = results.iterations[i];
        if (iterDict.hasOwnProperty(iter.Name) !== true) {
            iterDict[iter.Name] = true;
            iterations.push(iter);
            noParent[iter.Name] = [];
        }
    }
    var iterationNames = dojo.map(iterations, function (item) {
        return item.Name;
    });

    for (i = 0; i < results.level1.length; i++) // iterate through stories in level1
    {
        story = results.level1[i];
        if (story.Parent === null) {
            if (story.Iteration !== null && story.Iteration !== 'null') {
                iterName = story.Iteration.Name;
                if (noParent.hasOwnProperty(iterName)) {
                    noParent[iterName].push(story);
                    orphans += 1;
                }
            }
            else {
                noParent['No Iteration'].push(story);
                orphans += 1;
            }
        }
    }

    var epicTracker = {};
    var leaf = null;
    var epic = null;
    var num_leaf_stories = results.level1.length;
    for (var ix = 0; ix < num_leaf_stories; ix++) {
        leaf = level[0][ix];
        // ex -- epic index goes from highest possible level index to 1
        for (var ex = 4; ex > 0; ex--) {
            epic = level[ex][ix];
            if (typeof epic.FormattedID !== 'undefined') {
                if (typeof epicTracker[epic.FormattedID] === 'undefined') {
                    epicTracker[epic.FormattedID] = {'Name' : epic.Name};
                    for (var k = 0; k < iterations.length; k++) {
                        iterationName = iterations[k].Name;
                        epicTracker[epic.FormattedID][iterationName] = [];
                    }
                }
                iterName = leaf.Iteration !== null && leaf.Iteration !== 'null' ? leaf.Iteration.Name : 'No Iteration';
                if (itemInContainer(iterName, iterationNames)) {
                    epicTracker[epic.FormattedID][iterName].push(leaf);
                    break;
                }
            }
        }
    }
    epics = [];
    for (var property in epicTracker) {
        if (epicTracker.hasOwnProperty(property)) {
            epics.push(property);  // in this case property is actually the UserStory.FormattedID of an Epic user story
        }
    }
    epics.sort(byStoryFormattedID);

    var baked = {'iterations'   : iterations,
        'No Parent'    : noParent,
        'orphans'      : orphans,
        'epicsSequence': epics,
        'epicTracker'  : epicTracker
    };
    return baked;
}



//-----------------------------------------------------------------------------------

function showEpicFamilyProgress(results) {
    busySpinner.hide();
    fodder = organizeResults(results);  // dict with keys of 'iterations', 'No Parent', 'epicsSequence', 'epicTracker'
    table = document.getElementById("efp_table");  // epic family progress table
    clearTable(table);

    var iterations = dojo.map(fodder.iterations, function (it) {
        return it.Name;
    });

    var nop = fodder['No Parent'];
    var nopsInRelease = countNoParentStoriesInRelease(nop, iterations);
    if (nopsInRelease === 0 && fodder.epicsSequence.length === 0 && fodder.orphans === 0) {
        var noEpics = "There are no epic story chains defined for the selected release.";
        showEmptyEpics(table, noEpics);
        return;
    }
    //
    // clear out the table rows (including the header)
    //
    clearTable(table);


    // The column headers show the iterations that are inside the release
    //table.innerHTML = manufactureTableColumnHeaders(fodder.iterations);
    manufactureTableColumnHeaders(table, fodder.iterations);
    today = getRallyDate(new Date());

    // roll thru the fodder['No Parent'] sequence in iteration names order
    // create a table row with info for each iteration name from nop[iteration name]
    var nopCols = dojo.map(iterations, function (iterName) {
        return nop[iterName];
    });

    var x, iterName;
    for (x = 0; x < nopCols.length; x++) {
        // get the stories for each iteration
        iterName = iterations[x];
        nopStories = nopCols[x];
    }
    var tbod = document.getElementById("efpt_body");
    var row = document.createElement("tr");
    tbod.appendChild(row);
    var epicCell = document.createElement("td");
    row.appendChild(epicCell);
    epicCell.setAttribute("id", "row1_col1");
    epicCell.setAttribute("class", "storyData");
    epicCell.appendChild(document.createTextNode('No Parent'));

    var iterCell, iterCellContent;
    var userStories, iterStories, j;
    for (x = 0; x < nopCols.length; x++) {
        iterName = iterations[x];
        iterCell = document.createElement("td");
        row.appendChild(iterCell);
        iterCell.setAttribute("id", "row1_col" + (x + 2));
        iterCell.setAttribute("class", "storyData");
        iterCell.setAttribute("valign", "top");
        iterStories = [];
        userStories = nopCols[x];
        for (j = 0; j < userStories.length; j++) {
            story = userStories[j];
            storyName[story.FormattedID] = story.Name;
            storyCard = createStoryCard(story, today);  // storyCard is HTML text
            iterStories.push(storyCard);
        }
        iterCellContent = iterStories.join(" ");
        iterCell.innerHTML = iterCellContent;
    }

    var leafStories = [];
    for (var i = 0; i < fodder.epicsSequence.length; i++) {
        // before creating a row, first see if there are going to be any cells in which there
        // is going to be at least one card
        var epicInRelease = false;
        epicStory = fodder.epicsSequence[i];
        for (j = 0; j < iterations.length; j++) {
            iterName = iterations[j];
            leafStories = fodder.epicTracker[epicStory][iterName];
            if (leafStories.length > 0) {
                epicInRelease = true;
                break;
            }
        }

        if (!epicInRelease) {
            var p = 0;
        }
        else {
            row = document.createElement("tr");
            tbod.appendChild(row);
            epicCell = document.createElement("td");
            row.appendChild(epicCell);

            // strip any surrounding tag syntax
            epicStoryName = fodder.epicTracker[epicStory].Name;
            var protectedEpicName = epicStoryName.replace(/<\/?[^>]+(>|$)/g, "");
            epicLabel = epicStory + " " + protectedEpicName;
            epicCell.setAttribute("id", "row" + (i + 2) + "_col1");
            epicCell.setAttribute("class", "storyData");
            epicCell.appendChild(document.createTextNode(epicLabel));

            var rix = 0;
            var cix = 0;
            var epicColumns = [];
            for (j = 0; j < iterations.length; j++) {
                iterName = iterations[j];
                iterStories = [];
                leafStories = fodder.epicTracker[epicStory][iterName];
                for (var k = 0; k < leafStories.length; k++) {
                    story = leafStories[k];
                    storyName[story.FormattedID] = story.Name;
                    storyCard = createStoryCard(story, today);
                    iterStories.push(storyCard);
                }
                iterCellContent = iterStories.join(" ");
                iterCell = document.createElement("td");
                row.appendChild(iterCell);
                rix = i + 2;
                cix = j + 2;
                iterCell.setAttribute("id", "row" + rix + "_col" + cix);
                iterCell.setAttribute("class", "storyData");
                iterCell.setAttribute("valign", "top");
                iterCell.innerHTML = iterCellContent;
            }
        }
    }
}

//-----------------------------------------------------------------------------------

function onReleaseSelected() {
    // show a 'busy' spinner to show something's going on
    busySpinner.display("efp_table");
    var releaseName = releaseDropdown.getSelectedName();
    var releaseStart = releaseDropdown.getSelectedStart();
    var releaseEnd = releaseDropdown.getSelectedEnd();

    var iterationsQuery =
    { key  : 'iterations',
        type : 'iterations',
        fetch: 'Name,StartDate,EndDate',
        query: '( ( EndDate > "' + releaseStart + '" ) AND ( StartDate < "' + releaseEnd + '") )',
        order: 'EndDate'
    };

    var level1Stories =
    { key  : 'level1',
        type : 'hierarchicalrequirement',
        fetch: 'FormattedID,Name,ObjectID,Iteration,StartDate,EndDate,' +
                'PlanEstimate,TaskEstimateTotal,TaskRemainingTotal,' +
                'ScheduleState,Blocked,Parent',
        query: '( Release.Name contains "' + releaseName + '" )',
        order: 'Rank'
    };

    var level2Stories =
    { key: 'level2',
        placeholder: '${level1.parent?fetch=Name,FormattedID,Parent}'
    };

    var level3Stories =
    { key: 'level3',
        placeholder: '${level2.parent?fetch=Name,FormattedID,Parent}'
    };

    var level4Stories =
    { key: 'level4',
        placeholder: '${level3.parent?fetch=Name,FormattedID,Parent}'
    };

    var level5Stories =
    { key: 'level5',
        placeholder: '${level4.parent?fetch=Name,FormattedID,Parent}'
    };

    var queryArray = [iterationsQuery, level1Stories, level2Stories, level3Stories,
        level4Stories, level5Stories];

    rallyDataSource.findAll(queryArray, showEpicFamilyProgress);
}

function retrieveScheduleStatesAndProceed(results) {
    var accepted_seen = false;
    for (var state in results) {
        if (results.hasOwnProperty(state)) {
            if (accepted_seen === true) {
                acceptedStates.push(state);
            }
            else {
                if (state === 'Accepted') {
                    accepted_seen = true;
                }
            }
        }
    }

    releaseDropdown = new rally.sdk.ui.ReleaseDropdown({}, rallyDataSource);
    releaseDropdown.display("releaseList", onReleaseSelected);
}

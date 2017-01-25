var lastAdd = 0;

$(document).ready(function(){
	update(lastAdd)
	setInterval(function(){
		updateDailyClock();
	}, 1000);

	$(".prev").on("click", function(){
		update(--lastAdd);
	})

	$(".next").on("click", function(){
		update(++lastAdd);
	})
});

function update(add){
	console.log(getDailyChallenge(add, true, false, false));
	$(".descr").html((getDailyChallenge(add, false, true, false)));
}

function getDailyChallenge(add, objectOnly, textOnly, strengthOnly){
	var now = new Date().getTime();
	var dateSeed  = getDailyTimeString(add);
	var returnText = getDailyTopText(add);
	returnText = returnText[0];
	returnText += "<ul style='text-align: left'>";
	var seedStr = getRandomIntSeeded(dateSeed + 2, 1, 1e9);
	//seedStr = getRandomIntSeeded(seedStr, 1, 1e9);
	var weightTarget = getRandomIntSeeded(seedStr++, 20, 51) / 10;
	//Build a list of all modifiers to choose from
	var modifierList = [];
	var totalChance = 0;
	var dailyObject = {};
	
	for (var item in dailyModifiers){
		modifierList.push(item);
		totalChance += dailyModifiers[item].chance;
	}
	var chanceMod = 1000 / totalChance;
	var currentWeight = 0;
	var maxLoops = modifierList.length;
	var sizeCount = [0,0,0];// < 0.3, < 1, >= 1
	var sizeTarget = [getRandomIntSeeded(seedStr++, 0, 2), getRandomIntSeeded(seedStr++, 1, 5), getRandomIntSeeded(seedStr++, 2, 6)]
	if (weightTarget < 2.75) {
		sizeTarget[2] = 0; sizeTarget[0] += 2;
	}
	mainLoop: 
	for (var x = 0; x < maxLoops; x++){
		var maxZLoops = modifierList.length;
		var firstChoice = [];
		modLoop: 
		for (var z = 0; z < maxZLoops; z++){
			var roll = getRandomIntSeeded(seedStr++, 0, 1000);
			var selectedIndex;
			var checkedTotal = 0;
			lookupLoop:
			for (var y = 0; y < modifierList.length; y++){
				checkedTotal += dailyModifiers[modifierList[y]].chance * chanceMod;
				if ((roll < checkedTotal) || y == modifierList.length - 1){
					totalChance -= dailyModifiers[modifierList[y]].chance;
					chanceMod = 1000 / totalChance;
					selectedIndex = y;
					break lookupLoop;
				}
			}
			var selectedMod = modifierList[selectedIndex];
			var modObj = dailyModifiers[selectedMod];
			var str = modObj.minMaxStep[0] + (getRandomIntSeeded(seedStr++, 0, Math.floor(((modObj.minMaxStep[1] + modObj.minMaxStep[2]) * (1 / modObj.minMaxStep[2]))) - modObj.minMaxStep[0]) * modObj.minMaxStep[2]);
			var modWeight = modObj.getWeight(str);
			var modSize = (modWeight < 0.85) ? 0 : ((modWeight < 1.85) ? 1 : 2);
			if ((modWeight + currentWeight > weightTarget + 1) ) continue;
			if (everythingInArrayGreaterEqual(sizeTarget, sizeCount)){
				//use it and stuff
			}
			else if (sizeCount[modSize] >= sizeTarget[modSize] && z != maxZLoops - 1){
				if (!firstChoice.length) firstChoice = [selectedMod, str, selectedIndex, modSize, modWeight];
				continue modLoop;
			}
			else if (z == maxZLoops - 1 && firstChoice.length){
				selectedMod = firstChoice[0];
				modObj = dailyModifiers[selectedMod];
				selectedIndex = firstChoice[2];
				str = firstChoice[1];
				modSize = firstChoice[3];
				modWeight = firstChoice[4];
			}
			
			//It's been officially selected by this point
			sizeCount[modSize]++;
			returnText += "<li>" + modObj.description(str) + "</li>";
			dailyObject[modifierList[selectedIndex]] = {strength: str, stacks: 0};
			//console.log(selectedMod + "(strength: " + str + ", weight: " + modObj.getWeight(str) + "): " + modObj.description(str));
			currentWeight += modWeight;
			if (x > 0 && (currentWeight > weightTarget || (currentWeight >= weightTarget - 0.5 && currentWeight <= weightTarget + 0.5))){
				break mainLoop;
			}
			modifierList.splice(selectedIndex, 1);
			break modLoop;
		}

	}
	dailyObject.seed = dateSeed;
	if (strengthOnly) return getDailyHeliumValue(currentWeight);
	if (objectOnly) return dailyObject;
	if (countDailyWeight(dailyObject) != currentWeight) console.log('mismatch, objectCount = ' + countDailyWeight(dailyObject) + ", current = " + currentWeight);
	returnText += "</ul>Challenge has no end point, and grants an <u><b>additional "  + prettify(getDailyHeliumValue(currentWeight)) + "%</b></u> of all helium earned before finishing. <b>Can only be run once!</b> Reward does not count toward Bone Portals or affect best He/Hr stat.";	
	if (textOnly) return returnText;
	nextDaily = returnText;
	if (document.getElementById('specificChallengeDescription') != null) document.getElementById('specificChallengeDescription').innerHTML = returnText;
	updateDailyClock();
/* 	console.log("");
	console.log("Attempted challenge with weight of " + weightTarget + ", built challenge with weight of " + currentWeight);
	console.log("Target max for small, medium, large mods were: ", sizeTarget[0], sizeTarget[1], sizeTarget[2]);
	console.log("Actually made for small, medium large: ", sizeCount[0], sizeCount[1], sizeCount[2]);
	console.log("");
	console.log("Took " + (new Date().getTime() - now) + "ms");
	console.log("");
	console.log(""); */
	return returnText;
}

function getDailyTopText(add){
	readingDaily = add;
	var yesterdayDone = false;
	var todayDone = false;
	//var returnText = "<div class='row dailyTopRow'><div onmouseover='tooltip(\"Switch Daily\", null, event)' onmouseout='cancelTooltip()' onclick='lastAdd++;getDailyChallenge()' class='col-xs-4 noselect lowPad pointer dailyTop " ;
	var returnText = "<div class='row dailyTopRow'><div class='col-xs-4 noselect lowPad pointer dailyTop " ;
	if ((add == -1 && todayDone) || (!add && yesterdayDone)){
		returnText += 'colorGrey';
	}
	else returnText += 'colorSuccess';
	returnText += "'>Go To " + ((add == -1) ? "Today" : "Yesterday") + "</span>";
	//returnText += "'>Go To Tomorrow</span>";
	returnText += "</div><div class='col-xs-4 dailyTop lowPad'>Changes in <span id='dailyResetTimer'>00:00:00</span></div><div class='col-xs-4 lowPad dailyTop'>" + ((add == -1) ? getDailyTimeString(-1, true) : getDailyTimeString(0, true)) + "</div></div>";
	if ((add == -1 && yesterdayDone) || (!add && todayDone)){
		returnText += "<br/><br/>You have already attempted this Daily Challenge!";
		return [returnText, false];
	}
	return [returnText, true];

}

function getDailyTimeString(add, makePretty){
	var today = new Date();
	if (!add) add = 0;
	today.setDate(today.getDate() + add);
	var year = today.getUTCFullYear();
	var month = today.getUTCMonth() + 1; //For some reason January is month 0? Why u do dis?
	if (month < 10) month = "0" + month;
	var day = today.getUTCDate();
	if (day < 10) day = "0" + day;
	if (makePretty) return year + "-" + month + "-" + day;
	var seedStr = String(year) + String(month) + String(day);
	seedStr = parseInt(seedStr);
	return seedStr;
}

function countDailyWeight(dailyObj){
	var weight = 0;
	if (!dailyObj) dailyObj = game.global.dailyChallenge;
	for (var item in dailyObj){
		if (item == "seed") continue;
		weight += dailyModifiers[item].getWeight(dailyObj[item].strength);
	}
	return weight;
}

function getDailyHeliumValue(weight){
	//min 2, max 6
	var value = 75 * weight + 20;
	if (value < 100) value = 100;
	else if (value > 500) value = 500;
	return value;	
}

function updateDailyClock(justTime){
	var elem = document.getElementById('dailyResetTimer');
	if (elem == null && !justTime) return;
	var now = new Date();
	var secondsRemaining = 59 - now.getUTCSeconds();
	var minutesRemaining = 59 - now.getUTCMinutes();
	var hoursRemaining = 23 - now.getUTCHours();
	if (secondsRemaining <= 9) secondsRemaining = "0" + secondsRemaining;
	if (minutesRemaining <= 9) minutesRemaining = "0" + minutesRemaining;
	if (hoursRemaining <= 9) hoursRemaining = "0" + hoursRemaining;
	var timeRemaining = hoursRemaining + ":" + minutesRemaining + ":" + secondsRemaining;
	if (justTime) return timeRemaining;
	elem.innerHTML = timeRemaining;
}

function seededRandom(seed){
	var x = Math.sin(seed++) * 10000;
	return parseFloat((x - Math.floor(x)).toFixed(7));
}

function getRandomIntSeeded(seed, minIncl, maxExcl) {
	return Math.floor(seededRandom(seed) * (maxExcl - minIncl)) + minIncl;
}

function everythingInArrayGreaterEqual(smaller, bigger){
	if (bigger.length < smaller.length) return false;
	for (var x = 0; x < smaller.length; x++){
		if (smaller[x] > bigger[x]) return false;
	}
	return true;
}

function prettify(number) {
	var numberTmp = number;
	if (!isFinite(number)) return "<span class='icomoon icon-infinity'></span>";
	if (number >= 1000 && number < 10000) return Math.floor(number);
	if (number === 0) return prettifySub(0);
	if (number < 0) return "-" + prettify(-number);

	var base = Math.floor(Math.log(number)/Math.log(1000));
	if (base <= 0) return prettifySub(number);
	number /= Math.pow(1000, base);
	if (number >= 999.5) {
		// 999.5 rounds to 1000 and we don’t want to show “1000K” or such
		number /= 1000;
		++base;
	}
	
	var suffices = [
		'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud',
		'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv',
		'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tt'
	];
	var suffix;
	if (game.options.menu.standardNotation.enabled == 2 || (game.options.menu.standardNotation.enabled == 1 && base > suffices.length))
		suffix = "e" + ((base) * 3);
	else if (game.options.menu.standardNotation.enabled && base <= suffices.length)
		suffix = suffices[base-1];
	else
	{
		var exponent = parseFloat(numberTmp).toExponential(2);
		exponent = exponent.replace('+', '');
		return exponent;
	}
	
	return prettifySub(number) + suffix;
}

function prettifySub(number){
	number = parseFloat(number);
	var floor = Math.floor(number);
	if (number === floor) // number is an integer, just show it as-is
		return number;
	var precision = 3 - floor.toString().length; // use the right number of digits

	return number.toFixed(3 - floor.toString().length);
}

var dailyModifiers = {
		minDamage: {
            description: function (str) {
                return "Trimp min damage reduced by " + prettify(this.getMult(str) * 100) + "% (additive).";
            },
            getMult: function (str) {
                return 0.1 + ((str - 1) * 0.01);
            },
            getWeight: function (str) {
				return (1 / ((1.2 + (1 - this.getMult(str))) / 2 / 1.1)) - 1;    
            },
            minMaxStep: [41, 90, 1],
            chance: 1
        },
        maxDamage: {
            description: function (str) {
                return "Trimp max damage increased by " + prettify(this.getMult(str) * 100) + "% (additive).";
            },
            getMult: function (str) {
                return str;
            },
            getWeight: function (str) {
                return (1 - ((1.2 + (1 + str)) / 2 / 1.1));
            },
            minMaxStep: [1, 5, 0.25],
            chance: 1
        },
		plague: { //Half of electricity
			description: function (str) {
                return "Enemies stack a debuff with each attack, damaging Trimps for " + prettify(this.getMult(str, 1) * 100) + "% of total health per turn per stack, resets on Trimp death."
            },
            getMult: function (str, stacks) {
                return 0.01 * str * stacks;
			},
			getWeight: function (str) {
				var count = (str < 2) ? 15 : ((str < 3) ? 11 : ((str < 4) ? 9 : ((str < 5) ? 8 : ((str < 7) ? 7 : ((str < 10) ? 6 : (str < 17) ? 5 : 4)))));
				return ((10 / 8) + 6 - ((0.2 * count)/2) + ((((500 * count + 400) / count) / 500)-1) - ((10 - str) / 8)) / 1.75;
			},
			minMaxStep: [1, 10, 1],
			chance: 0.6,
			icon: "*bug2",
			stackDesc: function (str, stacks) {
				return "Your Trimps are taking " + prettify(this.getMult(str, stacks) * 100) + "% damage after each attack.";
			}
        },
		weakness: {
			description: function (str) {
				return "Enemies stack a debuff with each attack, reducing Trimp attack by " + prettify(100 - this.getMult(str, 1) * 100) + "% per stack. Stacks cap at 9 and reset on Trimp death.";
			},
			getMult: function (str, stacks) {
				return 1 - (0.01 * str * stacks);
			},
			getWeight: function (str) {
				return str / 4;
			},
			minMaxStep: [1, 10, 1],
			chance: 0.6,
			icon: "fire",
			stackDesc: function (str, stacks) {
				return "Your Trimps have " + prettify(100 - this.getMult(str, stacks) * 100) + "% less attack.";
			}
		},
		large: {
            description: function (str) {
                return "All housing can store " + prettify(100 - this.getMult(str) * 100) + "% fewer Trimps";
            },
            getMult: function(str) {
                return 1 - (0.01 * str);
            },
            getWeight: function (str) {
                return (1 / this.getMult(str) - 1) * 2;
            },
            start: function (str) {
                game.resources.trimps.maxMod = this.getMult(str);
            },
            abandon: function (str) {
                game.resources.trimps.maxMod = 1;
            },
            minMaxStep: [10, 60, 1],
            chance: 1
        },
		dedication: {
			description: function (str) {
				return "Gain " + prettify((this.getMult(str) * 100) - 100) + "% more resources from gathering";
			},
			getMult: function(str) {
				return 1 + (0.1 * str);
			},
			getWeight: function (str) {
				return 0.075 * str * -1;
			},
			minMaxStep: [5, 40, 1],
			chance: 0.75
		},
		famine: {
            description: function (str) {
                return "Gain " + prettify(100 - (this.getMult(str) * 100)) + "% less Metal, Food, Wood, and Gems from all sources";
            },
            getMult: function (str) {
                return 1 - (0.01 * str);
            },
            getWeight: function (str) {
                return (1 / this.getMult(str) - 1) / 2;
            },
            minMaxStep: [40, 80, 1],
            chance: 2
        },
		badStrength: {
			description: function (str) {
				return "Enemy attack increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
			},
			getMult: function (str) {
				return 1 + (0.2 * str);
			},
			getWeight: function (str){
				return 0.1 * str;
			},
			minMaxStep: [5, 15, 1],
			chance: 1
		},
		badHealth: {
			description: function (str) {
				return "Enemy health increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
			},
			getMult: function (str) {
				return 1 + (0.2 * str);
			},
			getWeight: function (str){
				return 0.2 * str;
			},
			minMaxStep: [3, 15, 1],
			chance: 1
		},
		badMapStrength: {
            description: function (str) {
                return "Enemy attack in maps increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
            },
            getMult: function (str) {
                return 1 + (0.3 * str);
            },
            getWeight: function (str){
                return (0.1 * (1 + 1/3)) * str;
            },
            minMaxStep: [3, 15, 1],
            chance: 1
        },
        badMapHealth: {
            description: function (str) {
                return "Enemy health in maps increased by " + prettify((this.getMult(str) * 100) - 100) + "%.";
            },
            getMult: function (str) {
                return 1 + (0.3 * str);
            },
            getWeight: function (str){
                return (0.3 * str) * (5 / 8);
            },
            minMaxStep: [3, 10, 1],
            chance: 1
        },
		crits: {
            description: function (str) {
                return "Enemies have a 25% chance to crit for " + prettify(this.getMult(str) * 100) + "% of normal damage";
            },
            getMult: function (str) {
                return 1 + (0.5 * str);
            },
            getWeight: function (str) {
                return 0.15 * this.getMult(str);
            },
            minMaxStep: [1, 24, 1],
            chance: 0.75
        },
        bogged: {
            description: function (str) {
                return "Your Trimps lose " + prettify(this.getMult(str) * 100) + "% of their max health after each attack.";
            },
            getMult: function (str) {
                return 0.01 * str;
            },
            getWeight: function (str) {
                var count = Math.ceil(1 / this.getMult(str));
                return (6 - ((0.2 * (count > 60 ? 60 : count) / 2)) + ((((500 * count + 400) / count) / 500)-1)) / 1.5;
            },
            minMaxStep: [1, 5, 1],
            chance: 0.75
        },
		dysfunctional: {
            description: function (str) {
                return "Your Trimps breed " + prettify(100 - (this.getMult(str) * 100)) + "% slower";
            },
            getMult: function (str) {
                return 1 - (str * 0.05);
            },
            getWeight: function (str){
                return ((1 / this.getMult(str))-1)/6;
            },
            minMaxStep: [10, 18, 1],
            chance: 1
        },
		oddTrimpNerf: {
            description: function (str) {
                return "Trimps have " + prettify(100 - (this.getMult(str) * 100)) + "% less attack on odd numbered zones";
            },
            getMult: function (str) {
                return 1 - (str * 0.02);
            },
            getWeight: function (str){
                return (1 / this.getMult(str) - 1) / 1.5;
            },
            minMaxStep: [15, 40, 1],
            chance: 1
        },
        evenTrimpBuff: {
            description: function (str) {
                return "Trimps have " + prettify((this.getMult(str) * 100) - 100) + "% more attack on even numbered zones";
            },
            getMult: function (str) {
                return 1 + (str * 0.2);
            },
            getWeight: function (str){
                return (this.getMult(str) - 1) * -1;
            },
            minMaxStep: [1, 10, 1],
            chance: 1
        },
		karma: {
			description: function (str) {
				return 'Gain a stack after killing an enemy, increasing all non Helium loot by ' + prettify((this.getMult(str, 1) * 100) - 100) + '%. Stacks cap at ' + this.getMaxStacks(str) + ', and reset after clearing a zone.';
			},
			stackDesc: function (str, stacks){				
				return "Your Trimps are finding " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more loot!";
			},
			getMaxStacks: function (str) {
				return Math.floor((str % 9) * 25) + 300;
			},
			getMult: function (str, stacks) {
				var realStrength = Math.ceil(str / 9);
				return 1 + (0.0015 * realStrength * stacks);
			},
			getWeight: function (str){
				return (this.getMult(str, this.getMaxStacks(str)) - 1) / -2;
			},
			icon: "*arrow-up",
			minMaxStep: [1, 45, 1],
			chance: 1
		},
		toxic: {
			description: function (str) {
				return "Gain a stack after killing an enemy, reducing breed speed by " + prettify(100 - (this.getMult(str, 1) * 100)) + '% (compounding). Stacks cap at ' + this.getMaxStacks(str) + ', and reset after clearing a zone.';
			},
			stackDesc: function (str, stacks){				
				return "Your Trimps are breeding " + prettify(100 - (this.getMult(str, stacks) * 100)) + "% slower.";
			},
			getMaxStacks: function (str) {
				return Math.floor((str % 9) * 25) + 300;
			},
			getMult: function (str, stacks) {
				var realStrength = Math.ceil(str / 9);
				return Math.pow((1 - 0.001 * realStrength), stacks);
			},
			getWeight: function (str){
				return (1 / this.getMult(str, this.getMaxStacks(str)) - 1) / 6;			
			},
			icon: "*radioactive",
			minMaxStep: [1, 45, 1],
			chance: 1
		},
		bloodthirst: {
			description: function (str) {
				return "Enemies gain a stack of Bloodthirst whenever Trimps die. Every " + this.getFreq(str) + " stacks, enemies will heal to full and gain an additive 50% attack. Stacks cap at " + this.getMaxStacks(str) + " and reset after killing an enemy.";
			},
			stackDesc: function (str, stacks) {
				var freq = this.getFreq(str);
				var max = this.getMaxStacks(str);
				var text = "This bad guy";
				if (stacks < max) {
					var next = (freq - (stacks % freq));
					text += " will heal to full and gain attack in " + next + " stack" + ((next == 1) ? "" : "s") + ", " + ((stacks >= freq) ? "" : " and") + " gains 1 stack whenever Trimps die";
				}
				if (stacks >= freq){
					if (stacks < max) text += ", and";
					text += " currently has " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more attack";
				}
				text += ".";
				return text;
			},
			getMaxStacks: function (str) {
				return (this.getFreq(str) * (2 + Math.floor(str / 2)));
			},
			getFreq: function(str){
				return 10 - str;
			},
			getMult: function (str, stacks){
				var count = Math.floor(stacks / this.getFreq(str));
				return 1 + (0.5 * count);
			},
			getWeight: function (str) {
				return 0.5 + (0.25 * Math.floor(str / 2));
			},
			minMaxStep: [1, 7, 1],
			chance: 1,
			icon: "*flask",
			iconOnEnemy: true
		},
		explosive: {
			description: function (str) {
				var text = "Enemies instantly deal " + prettify(this.getMult(str) * 100) + "% of their attack damage when killed";
				if (str > 15) {
					text += " unless your block is as high as your maximum health";
				}
				text += ".";
				return text;
			},
			getMult: function (str) {
				return str;
			},
			getWeight: function (str) {
				var mult = this.getMult(str);
				if (str <= 15){
					return (3/20 * mult) + (1/4);
				}
				else {
					return (1/14 * mult) - (1/7);
				}
			},
			minMaxStep: [5, 30, 1],
			chance: 1
		},
		slippery: {
			description: function (str) {
				return "Enemies have a " + prettify(this.getMult(str) * 100) + "% chance to dodge your attacks on " + ((str <= 15) ? "odd" : "even") + " zones.";
			},
			getMult: function (str){
				if (str > 15) str -= 15;
				return 0.02 * str;
			},
			getWeight: function (str) {
				return (1 / (1 - this.getMult(str)) - 1) * 10 / 1.5;
			},
			minMaxStep: [1, 30, 1],
			chance: 1
		},
		rampage: {
			description: function (str) {
				return "Gain a stack after killing an enemy, increasing Trimp attack by " + prettify((this.getMult(str, 1) * 100) - 100) + '% (additive). Stacks cap at ' + this.getMaxStacks(str) + ', and reset when your Trimps die.';
			},
			stackDesc: function (str, stacks){             
				return "Your Trimps are dealing " + prettify((this.getMult(str, stacks) * 100) - 100) + "% more damage.";
			},
			getMaxStacks: function (str) {
				return Math.floor((str % 10 + 1) * 10);
			},
			getMult: function (str, stacks) {
				var realStrength = Math.ceil(str / 10);
				return 1 + (0.01 * realStrength * stacks);
			},
			getWeight: function (str){
				return (1 - this.getMult(str, 1)) * this.getMaxStacks(str);
			},
			icon: "*fire",
			minMaxStep: [1, 40, 1],
			chance: 1
		}
	};

var canvas, ball, player, dummyP, stage2, stage1;
var currentAnimation, animating;
var drag = false, dragged = false;;
var teams = [];
var animations = {};
var arrowPoint = {};

//debug variables
var ball1, ball2;

$(document).ready(function(){
	$("#modal1").modal();
	$(".button-collapse").sideNav();

	/*cookie = document.cookie;
	if(cookie === ""){
		if(window.innerWidth > 600) {
			$('#modal1').modal('open');
		} else {
			$(".button-collapse").sideNav('show');
		}
	} else {
		$('.noshow').prop('checked', true);
	}*/

	a = $('#a')[0].getContext('2d');
	c = $('#c')[0].getContext('2d');
	c.canvas.height = 800;
	c.canvas.width = 480;
	a.canvas.height = 800;
	a.canvas.width = 480;


	backStage = drawField();

	stage1 = new createjs.Stage("c");
	stage2 = new createjs.Stage("a");

	stage1.enableMouseOver();
	createjs.Touch.enable(stage1);
	stage2.enableMouseOver();

	//ball1 = new Ball(0,0, true);
	//ball2 = new Ball(0,0, true);
	dummyP = new Point(-1000,-1000);

	ball = new Ball(160, 120, false);
	teams.push(new Team("Blue"));
	teams.push(new Team("Red"));
	teams[1].shadow = false;
	for(var t in teams){
		for(var i = 0; i<11; i++){
			teams[t].addPlayer(50+50*t,50+50*i, i);
		}
	}

	stage1.update();

	start_anim = new Anim(1000, 20, '{\
							  "ball": [\
							    185,\
							    185\
							  ],\
							  "teams": [\
							    [\
									[110, 230],\
									[230, 270],\
									[350, 280],\
									[110, 400],\
									[240, 400],\
									[400, 400],\
									[240, 530],\
									[110 , 610],\
									[240, 610],\
									[400, 610],\
									[240, 790]\
							    ],\
							    [\
									[70 , 260],\
									[160, 180],\
									[320, 180],\
									[420, 260],\
									[70 , 440],\
									[240, 440],\
									[420, 440],\
									[70 , 650],\
									[240, 650],\
									[420, 650],\
									[240, 30]\
								]\
							  ]\
							}');

	//Very hard coded player positions
	animations["ani1"] = new Anim(1000, 20, '{\
							  "ball": [\
							    125,\
							    185\
							  ],\
							  "teams": [\
							    [\
							      [135, 245],\
							      [225, 245],\
							      [205, 310],\
							      [60, 360],\
							      [325, 435],\
							      [230, 735]\
							    ],\
							    [\
							      [120, 170],\
							      [350, 170],\
							      [230, 25],\
							      [290, 400],\
							      [70, 555],\
							      [380, 665]\
							    ]\
							  ]\
							}');

	animations["ani2"] = new Anim(1000, 20, '{\
							  "ball": [\
							    340,\
							    185\
							  ],\
							  "teams": [\
							    [\
							      [135, 245],\
							      [225, 245],\
							      [205, 310],\
							      [60, 360],\
							      [325, 435],\
							      [230, 735]\
							    ],\
							    [\
							      [120, 170],\
							      [350, 170],\
							      [230, 25],\
							      [290, 400],\
							      [70, 555],\
							      [380, 665]\
							    ]\
							  ]\
							}');

	animations["ani3"] = new Anim(1000, 20, '{\
							  "ball": [\
							    340,\
							    185\
							  ],\
							  "teams": [\
							    [\
							      [250, 245],\
							      [335, 245],\
							      [245, 310],\
							      [165, 435],\
							      [410, 360],\
							      [230, 735]\
							    ],\
							    [\
							      [120, 170],\
							      [350, 170],\
							      [230, 25],\
							      [290, 400],\
							      [70, 555],\
							      [380, 665]\
							    ]\
							  ]\
							}');

	$('.animate').on("click", function(){
		currentAnimation = animations[this.id].fresh();
		animating = true;
	})

	$('.shadow').on("click", function(){
		t = (this.id)==="blue" ? 0 : 1;
		teams[t].toggleShadow();
		$(this).children().toggleHTML('network_wifi', 'signal_wifi_off');
	});

	$('.ball').on("click", function(){
		ball.toggle();
		$(this).children().toggleHTML('album', 'fiber_manual_record');
	});

	$('#okay').on("click", function(){
		$('.button-collapse').sideNav('hide');
	});

	$('.noshow').on("click", function(){
		if($(this).is(":checked")){
			document.cookie = "show=false";
		} else {
			document.cookie = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
		}
	});

	stage1.addEventListener("stagemousedown", function(evt){
		arrowPoint = new Point(evt.stageX, evt.stageY);
	});

	stage1.addEventListener("stagemouseup", function(evt) {
		if (!drag){
			if (Math.abs(evt.stageX - arrowPoint.x) < 10 && Math.abs(evt.stageY - arrowPoint.y) < 10){
				return
			}
			new Arrow(arrowPoint, new Point(evt.stageX, evt.stageY));
		}
	});

	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick", tick);

	$(window).resize(function() { processAutoheight(); });
    $(document).resize(function() { processAutoheight(); });
    processAutoheight();

	currentAnimation = start_anim.fresh();
	animating = true;
});

function tick(event){
	if(animating){
		currentAnimation.animate(event.delta);
	}
}

function drawField(){
	back = $('#b')[0].getContext('2d');
	back.canvas.height = 800;
	back.canvas.width = 480;
	back = new createjs.Stage("b");
	field = new createjs.Shape();
	field.graphics.beginStroke("#000")
		.setStrokeStyle(1)
		.drawRect(20,20,440,780)
		.moveTo(20,420)
		.lineTo(460, 420)
		.moveTo(20,220)
		.lineTo(460, 220)
		.moveTo(20, 600)
		.lineTo(460, 600)
		.moveTo(420, 20)
		.arc(240, 20, 180, 0, Math.PI)
		.moveTo(60, 800)
		.arc(240, 800, 180, Math.PI, 0)
		.es();
	field.snapToPixel = true;
	back.addChild(field);

	back.update();
	return back;
}

class Team {
	constructor(color){
		this.color = color;
		this.shadow = true;
		this.players = [];
	}

	toggleShadow(){
		this.shadow = !this.shadow;
		for(var p in this.players){
			this.players[p].shadow();
		}
		stage2.update();
	}

	addPlayer(x, y, id){
		this.players.push(new Player(x, y, this, id));
	}
}

class Ball {
	constructor(x, y, zone){
		var _self = this;
		this.p = new Point(x, y);
		this.zone = zone;
		this.ball = new createjs.Shape();
		stage1.addChild(this.ball);
		this.redraw();

		this.ball.on("pressmove", function(evt) {
			_self.move(evt.stageX, evt.stageY, true);
			if(dragged){
			    drag = true;
			}
			dragged = true;
		});
		this.ball.on("pressup", function(evt) {
			if(!drag){
				_self.toggle();
			}
			drag = dragged = false;
		})
	}

	toggle(){
		this.zone ^= 1;
		this.redraw();
	}

	delete(){
		stage1.removeChild(this.ball);
		this.ball = null;
	}

	move(x, y, draw){
		this.p.x = x;
		this.p.y = y;
		this.draw(draw);
	}

	moveBy(dx, dy, draw){
		this.move(this.p.x + dx, this.p.y + dy, draw);
	}

	redraw(){
		this.ball.graphics.clear();
		if(!this.zone){
			this.ball.graphics.beginFill("rgba(255, 255, 0, 0.3)").beginStroke("Gray").arc(0, 0, 60, 0, Math.PI*2);
		}
		this.ball.graphics.beginFill("Yellow").beginStroke("Black").arc(0, 0, 8, 0, Math.PI*2);
		this.draw(true);
	}

	draw(draw){
		this.ball.x = this.p.x;
		this.ball.y = this.p.y;
		for(var t in teams){
			var players = teams[t].players;
			for(var p in players){
				p = players[p];
				p.hasBall = (dist(ball.p, p.p)<25)
				p.update();
			}
		}
		if(draw){
			stage1.update();
			stage2.update();
		}
	}
}

var LINE_RADIUS = 3
var ARROWHEAD_RADIUS = 5;
var ARROWHEAD_DEPTH = 10;

class Arrow {
	constructor(start, end){
		var _self = this;
        this.arrow = new createjs.Shape();
        var arrowSize = dist(start, end);
        var arrowRotation = angle(start, end);
        this.arrow.graphics.s("Black")
                .f("Black")
                .mt(0, 0)
                .lt(0, LINE_RADIUS)
                .lt(arrowSize - ARROWHEAD_DEPTH, LINE_RADIUS)
                .lt(arrowSize - ARROWHEAD_DEPTH, ARROWHEAD_RADIUS)
                .lt(arrowSize, 0)
                .lt(arrowSize - ARROWHEAD_DEPTH, -ARROWHEAD_RADIUS)
                .lt(arrowSize - ARROWHEAD_DEPTH, -LINE_RADIUS)
                .lt(0, -LINE_RADIUS)
                .lt(0, 0)
                .es();
        this.arrow.x = start.x;
        this.arrow.y = start.y;
        this.arrow.alpha = 1;
        this.arrow.rotation = arrowRotation;

        this.arrow.addEventListener("click", function(evt){
        	stage1.removeChild(_self.arrow);
        	stage1.update();
        });

        stage1.addChild(this.arrow);
        stage1.update();

    }
}

class Player {
	constructor(x, y, team, id){
		var _self = this;
		this.p = new Point(x, y);
		this.player = new createjs.Shape();
		this.shade = new Shadow(dummyP, dummyP, dummyP, dummyP, this);
		this.team = team;
		this.hasBall = false;

		this.text = new createjs.Text(String(id+1), "12px Arial", "#ffffff");
		this.player.graphics.beginFill(this.team.color).beginStroke("Black").arc(0, 0, 10, 0, Math.PI*2);
		this.player.graphics.setStrokeStyle(2).moveTo(-24, 0).lineTo(24, 0);
		this.player.x = this.p.x;
		this.player.y = this.p.y;
		this.rotate();
		    
		this.player.on("pressmove", function(evt) {
			var dx = evt.stageX - _self.p.x;
			var dy = evt.stageY - _self.p.y;
			_self.p.x += dx;
			_self.p.y += dy;
			if(_self.hasBall){
				ball.moveBy(dx, dy);
			}
			_self.rotate();
			_self.shadow();
			_self.draw(true);
			if(dragged){
			    drag = true;
			}
			dragged = true;
		});
		this.player.on("pressup", function(evt) {
			if(!drag){
				evt.target.alpha = (evt.target.alpha*2%2+1)/2;
				_self.draw(true);			
			}
			drag = dragged = false;
		});
		stage1.addChild(this.player);
		stage1.addChild(this.text);
		_self.shadow();
	}

	move(x, y, draw){
		this.p.x = x;
		this.p.y = y;
		this.draw(draw);
	}

	moveBy(dx, dy, draw){
		this.move(this.p.x + dx, this.p.y + dy, draw);
	}


	rotate(){
		if(this.player.alpha == 1){
			this.player.rotation = 90+180*Math.atan((ball.p.y-this.p.y)/(ball.p.x-this.p.x))/Math.PI;
		}
	}

	update(){
		this.rotate();
		this.shadow();
	}

	draw(draw){
		this.player.x = this.p.x;
		this.player.y = this.p.y;

		var b = this.text.getBounds();
		this.text.x = this.p.x - (b.width)/2
		this.text.y = this.p.y - (b.height)/2;

		if(draw){
			stage1.update();
			stage2.update();
		}
	}

	shadow(){
		if(this.team.shadow){
			var a = this.player.rotation*Math.PI/180
			var p1 = new Point(this.p.x+Math.cos(a)*24, this.p.y+Math.sin(a)*24);
			var p2 = new Point(this.p.x-Math.cos(a)*24, this.p.y-Math.sin(a)*24);

			this.shade.draw(p1,line(p1),p2,line(p2));
			//ball1.x = x1; ball1.y = y1; ball1.draw();
			//ball2.x = x2; ball2.y = y2; ball2.draw();
		} else {
			this.shade.clear();
		}
	}
}

class Point {
	constructor(x, y){
		this.x = x;
		this.y = y;
	}
}

class Shadow {
	constructor(p1, w1, p2, w2, player){
		this.obj = new createjs.Shape();
		stage2.addChild(this.obj);
		this.player = player;
		this.draw(p1, w1, p2, w2);
	}

	draw(p1, w1, p2, w2){
		var c1 = cornerify(w1, this.player);
		var c2 = cornerify(w2, this.player);
		this.obj.graphics.clear()
			.moveTo(p1.x, p1.y)
			.beginFill("rgb(230,230,230)")
			.lineTo(p2.x, p2.y)
			.lineTo(w2.x, w2.y)
			.lineTo(c2.x, c2.y)
			.lineTo(c1.x, c1.y)
			.lineTo(w1.x, w1.y)
			.lineTo(p1.x, p1.y);
	}

	clear(){
		this.obj.graphics.clear();
		stage2.update();
	}
}

class Anim {
	constructor(time, speed, json){
		this.time = time;
		this.delta = time;
		this.speed = speed;
		this.objects = [];
		this.parse(json);
	}

	fresh(){
		this.delta = this.time;
		return this;
	}

	parse(json){
		json = JSON.parse(json);
		for(var t in json["teams"]){
			for(var p in json["teams"][t]){
				this.addObj(teams[t].players[p], json["teams"][t][p][0], json["teams"][t][p][1]);
			}
		}
		this.addObj(ball, json["ball"][0], json["ball"][1]);
	}

	addObj(obj, x, y){
		this.objects.push({"obj" : obj, "x" : x, "y" : y});
	}

	animate(d){
		for(var t in this.objects){
			var o = this.objects[t];
			if(this.delta-d > 0){
				var dx = (o["x"] - o["obj"].p.x)*d/this.delta;
				var dy = (o["y"] - o["obj"].p.y)*d/this.delta;

				o["obj"].moveBy(dx, dy, false);
			} else {
				o["obj"].move(o["x"], o["y"], false);
			}
		}
		if((this.delta-=d) <= 0){
			this.delta = this.time;
			animating = false;
		}
		stage1.update();
		stage2.update();
	}
}

function cornerify(p1, pl){
	var x, y;
	if(p1.y % 780 == 20){ //
		if(pl.p.x < ball.p.x){
			x = 20
			y = p1.y;
		} else {
			x = 460;
			y = p1.y;
		}
	} else {
		if (pl.p.y < ball.p.y){
			x = p1.x;
			y = 20;
		} else {
			x = p1.x;
			y = 800;
		}
	}
	return new Point(x, y);
}

function line(point){
	var d = (point.y-ball.p.y)/(point.x-ball.p.x);
	var p;
	if(point.x > ball.p.x){
		p = new Point(460, ball.p.y+(460-ball.p.x)*d);
		if (p.y > 800){
			p.y = 800;
			p.x = ball.p.x+(800-ball.p.y)/d;
		} else if (p.y < 20){
			p.y = 20;
			p.x = ball.p.x-(ball.p.y-20)/d;
		}
	} else {
		p = new Point(20, ball.p.y-(ball.p.x-20)*d);
		if (p.y > 800){
			p.y = 800;
			p.x = ball.p.x+(800-ball.p.y)/d;
		} else if (p.y < 20){
			p.y = 20;
			p.x = ball.p.x-(ball.p.y-20)/d;
		}
	}
	return p;
}

function dist(p1, p2){
	var a = p1.x - p2.x;
	var b = p1.y - p2.y;
	return Math.sqrt(a*a+b*b);
}

function angle(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function processAutoheight(){
    var maxHeight = 0;

    // This will check first level children ONLY as intended.
    $(".wrapper > *").each(function(){

        height = $(this).outerHeight(true); // outerHeight will add padding and margin to height total
        if (height > maxHeight ) {
            maxHeight = height;
        }
    });

    $(".wrapper").height(maxHeight);
}

$.fn.toggleHTML = function(a, b) {
    return this.html(function(_, html) {
        return $.trim(html) === a ? b : a;
    });
}

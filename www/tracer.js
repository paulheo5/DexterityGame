class Tracer{
  constructor(path, graphicsObject){
    this.pathSpacing = 3;
    this.path = resamplePath(path, this.pathSpacing);
    this.pointerID;
    this.startingPoint;
    this.indexOfNextPoint;
    this.checkedDirection;
    this.checkedDirectionCounter = 0;
    this.nextPoint;
    this.currentPoint;
    this.direction;
    this.distanceThreshold = 100;
    this.dist;
    this.offsetX = graphicsObject.x;
    this.offsetY = graphicsObject.y;
    this.pathFinished = false;
  }

  start(x, y){
    x -= this.offsetX;
    y -= this.offsetY;

    this.startingPoint = null;
    this.indexOfNextPoint = null;
    this.checkedDirection = null;
    this.checkedDirectionCounter = 0;
    this.nextPoint = null;
    this.currentPoint = null;
    this.distanceThreshold = 100;
    this.direction = null;
    this.dist = null;
    this.previousTrace = [x, y];

    var startingPoint;
    var startingPointIndex;
    for (var [i, point] of this.path.entries()){
      this.dist = Phaser.Math.Distance.Between(x, y, point[0], point[1]);
      if (this.dist < this.distanceThreshold){
        startingPoint = point;
        startingPointIndex = i;
        this.distanceThreshold = this.dist;
      }
    }
    this.startingPoint = startingPoint;
    this.indexOfNextPoint = startingPointIndex;
  }

  trace(x, y){
    x -= this.offsetX;
    y -= this.offsetY;

    // interpolate from previous x,y to the new one
    var interpolatedTrace = interpolate(this.previousTrace, [x,y], this.pathSpacing)

    // do _traceSinglePoint for each of the interpolated points on the way to x,y
    for(var point of interpolatedTrace){
      this._traceSinglePoint(point[0], point[1]);
    }

    // do _traceSinglePoint for x,y itself
    this._traceSinglePoint(x,y);

    // remember x,y as the previous position
    this.previousTrace = [x, y];
  }

  _traceSinglePoint(x,y){
    if (!this.checkedDirection){
      this._findDirectionAndNextPoint(x, y, this.path);
      this.checkedDirectionCounter ++;
      if (this.checkedDirectionCounter == 15)
        this.checkedDirection = true;
    }
    this._traceUserTouch(x, y, this.path);
  }

  _findIndexOfPoint(index, arrayLength){
    return ((index % arrayLength) + arrayLength) % arrayLength;
  }

  _findDirectionAndNextPoint(x, y, path){
    var nextPoint = path[this._findIndexOfPoint(this.indexOfNextPoint+1, path.length)];
    var prevPoint = path[this._findIndexOfPoint(this.indexOfNextPoint-1, path.length)];
    if (Phaser.Math.Distance.Between(x, y, nextPoint[0], nextPoint[1]) <
          Phaser.Math.Distance.Between(x, y, prevPoint[0], prevPoint[1])){
        this.direction = 1;
        this.nextPoint = nextPoint;
    }
    else {
        this.direction = -1;
        this.nextPoint = prevPoint;
    }
  }

  _traceUserTouch(x, y, path){
    if (this.direction && this.checkedDirection){
      if (Phaser.Math.Distance.Between(x, y, this.nextPoint[0], this.nextPoint[1]) <= 15){
        this.currentPoint = this.nextPoint;
        this.indexOfNextPoint = this._findIndexOfPoint(this.indexOfNextPoint + this.direction, path.length);
        this.nextPoint = path[this.indexOfNextPoint];
        if (this.onPointReached)
          this.onPointReached(this.currentPoint[0] + this.offsetX, this.currentPoint[1] + this.offsetY);
        if (this.startingPoint[0] == this.currentPoint[0] && this.startingPoint[1] == this.currentPoint[1])
          this.pathFinished = true;
      }
    }
  }
}

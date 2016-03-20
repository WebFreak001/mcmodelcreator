MCBlockGeometry = (function() {
    function MCBlockGeometry(width, height, depth) {
        THREE.Geometry.apply(this, []);
        this.index = 0;

        width *= 0.5;
        height *= 0.5;
        depth *= 0.5;

        this.makePlane("north", width, height, -depth, [0, 0, 16, 16]);
        this.makePlane("south", width, height, depth, [0, 0, 16, 16]);
        this.makePlane("west", width, height, depth, [0, 0, 16, 16]);
        this.makePlane("east", -width, height, depth, [0, 0, 16, 16]);
        this.makePlane("up", width, height, depth, [0, 0, 16, 16]);
        this.makePlane("down", width, -height, depth, [0, 0, 16, 16]);

        this.uvsNeedUpdate = true;
    }

    MCBlockGeometry.prototype = Object.create(THREE.Geometry.prototype);
    MCBlockGeometry.prototype.constructor = MCBlockGeometry;

    MCBlockGeometry.prototype.makePlane = function(side, x, y, z, texCoords) {
        if (side == "north" || side == "south")
            this.makePlaneNorth(x, y, z);
        if (side == "west" || side == "east")
            this.makePlaneWest(x, y, z);
        if (side == "up" || side == "down")
            this.makePlaneUp(x, y, z);

        var uvs = [
            new THREE.Vector2(texCoords[0], texCoords[1]),
            new THREE.Vector2(texCoords[2], texCoords[1]),
            new THREE.Vector2(texCoords[0], texCoords[3]),
            new THREE.Vector2(texCoords[2], texCoords[3])
        ];

        this.faceVertexUvs[0].push([uvs[0], uvs[1], uvs[2]]);
        this.faceVertexUvs[0].push([uvs[2], uvs[1], uvs[3]]);

        if (side == "north" || side == "west" || side == "up") {
            this.faces.push(new THREE.Face3(
                this.index + 0, this.index + 1, this.index + 2,
                MCBlockGeometry.normalMap[side],
                new THREE.Color(0xFFFFFF),
                MCBlockGeometry.materialMap[side])
            );
            this.faces.push(new THREE.Face3(
                this.index + 2, this.index + 1, this.index + 3,
                MCBlockGeometry.normalMap[side],
                new THREE.Color(0xFFFFFF),
                MCBlockGeometry.materialMap[side])
            );
        }
        else {
            this.faces.push(new THREE.Face3(
                this.index + 2, this.index + 1, this.index + 0,
                MCBlockGeometry.normalMap[side],
                new THREE.Color(0xFFFFFF),
                MCBlockGeometry.materialMap[side])
            );
            this.faces.push(new THREE.Face3(
                this.index + 3, this.index + 1, this.index + 2,
                MCBlockGeometry.normalMap[side],
                new THREE.Color(0xFFFFFF),
                MCBlockGeometry.materialMap[side])
            );
        }
        this.index += 4;
    };

    MCBlockGeometry.prototype.makePlaneNorth = function(x, y, z) {
        this.vertices.push(new THREE.Vector3(-x, y, z));
        this.vertices.push(new THREE.Vector3(x, y, z));
        this.vertices.push(new THREE.Vector3(-x, -y, z));
        this.vertices.push(new THREE.Vector3(x, -y, z));
    };

    MCBlockGeometry.prototype.makePlaneWest = function(x, y, z) {
        this.vertices.push(new THREE.Vector3(x, y, -z));
        this.vertices.push(new THREE.Vector3(x, y, z));
        this.vertices.push(new THREE.Vector3(x, -y, -z));
        this.vertices.push(new THREE.Vector3(x, -y, z));
    };

    MCBlockGeometry.prototype.makePlaneUp = function(x, y, z) {
        this.vertices.push(new THREE.Vector3(-x, y, z));
        this.vertices.push(new THREE.Vector3(x, y, z));
        this.vertices.push(new THREE.Vector3(-x, y, -z));
        this.vertices.push(new THREE.Vector3(x, y, -z));
    };

    MCBlockGeometry.materialMap = {
        down: 0,
        up: 1,
        north: 2,
        south: 3,
        west: 4,
        east: 5
    };

    MCBlockGeometry.normalMap = {
        down: new THREE.Vector3(0, -1, 0),
        up: new THREE.Vector3(0, 1, 0),
        north: new THREE.Vector3(0, 0, -1),
        south: new THREE.Vector3(0, 0, 1),
        west: new THREE.Vector3(-1, 0, 0),
        east: new THREE.Vector3(1, 0, 0)
    };

    return MCBlockGeometry;
} ());
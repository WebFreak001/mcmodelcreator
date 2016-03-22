ModelCreator = {
    Element: (function() {
        /**
         *
         * @param {THREE.Vector3} size
         * @param {THREE.Vector3} position
         * @param {THREE.Vector3} rotation
         * @param {THREE.Vector3} origin
         * @constructor
         */
        function Element(size, position, rotation, origin) {
            this.exists = true;
            this.size = size || new THREE.Vector3();
            this.position = position || new THREE.Vector3();
            this.rotation = rotation || new THREE.Vector3();
            this.origin = origin || new THREE.Vector3();
            this.name = "Unnamed Element";

            this.createGeometry(false);
            this.material = new THREE.MeshLambertMaterial({
                color: 0xFF00FF
            });

            this.mesh = new THREE.Mesh(
                this.geometry,
                this.material
            );
            this.mesh.position = this.position;
        }

        Element.toRad = function(deg) {
            return deg * (Math.PI / 180);
        };
        
        Element.deserialize = function(object) {
            var name = object.__name || "Unnamed Element";
            var position = object.from || [0, 0, 0];
            var to = object.to || [0, 0, 0];
            var size = [to[0] - position[0], to[1] - position[1], to[2] - position[2]];
            var rotation = [0, 0, 0];
            var origin = [8, 8, 8];
            if (object.rotation) {
                if (object.rotation.axis == "x")
                    rotation[0] = object.rotation.angle;
                else if (object.rotation.axis == "y")
                    rotation[1] = object.rotation.angle;
                else if (object.rotation.axis == "z")
                    rotation[2] = object.rotation.angle;
                origin = object.rotation.origin || [8, 8, 8];
            }
            var element = new Element(
                new THREE.Vector3(size[0], size[1], size[2]),
                new THREE.Vector3(position[0], position[1], position[2]),
                new THREE.Vector3(rotation[0], rotation[1], rotation[2]),
                new THREE.Vector3(origin[0], origin[1], origin[2])
            );
            element.name = name;
            return element;
        };

        /**
         *
         * @param {boolean} setMesh
         */
        Element.prototype.createGeometry = function(setMesh) {
            this.geometry = new MCBlockGeometry(this.size.x, this.size.y, this.size.z);

            this.geometry.applyMatrix(
                new THREE.Matrix4().makeTranslation(this.size.x * 0.5, this.size.y * 0.5, this.size.z * 0.5)
            );

            this.geometry.applyMatrix(
                new THREE.Matrix4().makeTranslation(-this.origin.x, -this.origin.y, -this.origin.z)
            );

            this.geometry.applyMatrix(
                new THREE.Matrix4().makeRotationX(Element.toRad(this.rotation.x))
            );
            this.geometry.applyMatrix(
                new THREE.Matrix4().makeRotationY(Element.toRad(this.rotation.y))
            );
            this.geometry.applyMatrix(
                new THREE.Matrix4().makeRotationZ(Element.toRad(this.rotation.z))
            );

            this.geometry.applyMatrix(
                new THREE.Matrix4().makeTranslation(this.origin.x, this.origin.y, this.origin.z)
            );

            if (setMesh) {
                this.mesh.geometry = this.geometry;
            }
        };

        /**
         *
         * @param {THREE.Vector3} size
         */
        Element.prototype.setSize = function(size) {
            this.size = size;
            this.createGeometry(true);
        };

        /**
         *
         * @param {THREE.Vector3} position
         */
        Element.prototype.setPosition = function(position) {
            this.position = position;

            this.mesh.position.x = position.x;
            this.mesh.position.z = position.z;
            this.mesh.position.y = position.y;
        };

        /**
         *
         * @param {THREE.Vector3} rotation
         */
        Element.prototype.setRotation = function(rotation) {
            this.rotation = rotation;
            this.createGeometry(true);
        };

        /**
         *
         * @param {THREE.Vector3} origin
         */
        Element.prototype.setOrigin = function(origin) {
            this.origin = origin;
            this.createGeometry(true);
        };
        
        Element.prototype.serialize = function() {
            return {
                __name: this.name,
                from: [this.position.x, this.position.y, this.position.z],
                to: [this.position.x + this.size.x, this.position.y + this.size.y, this.position.z + this.size.z],
                rotation: this.serializeRotation(),
                shade: true, // TODO: make changable
                faces: { // TODO: make changable
                    down: { uv: [0, 0, 16, 16], texture: "#particle", cullface: undefined, rotation: 0, tintIndex: 0 },
                    up: { uv: [0, 0, 16, 16], texture: "#particle", cullface: undefined, rotation: 0, tintIndex: 0 },
                    north: { uv: [0, 0, 16, 16], texture: "#particle", cullface: undefined, rotation: 0, tintIndex: 0 },
                    south: { uv: [0, 0, 16, 16], texture: "#particle", cullface: undefined, rotation: 0, tintIndex: 0 },
                    west: { uv: [0, 0, 16, 16], texture: "#particle", cullface: undefined, rotation: 0, tintIndex: 0 },
                    east: { uv: [0, 0, 16, 16], texture: "#particle", cullface: undefined, rotation: 0, tintIndex: 0 }
                }
            };
        };
        
        Element.prototype.serializeRotation = function() {
            if (this.rotation.x)
                return this.makeRotation("x", this.rotation.x);
            if (this.rotation.y)
                return this.makeRotation("y", this.rotation.y);
            if (this.rotation.z)
                return this.makeRotation("z", this.rotation.z);
            return undefined;
        };
        
        Element.prototype.makeRotation = function(axis, angle) {
            return {
                origin: [this.origin.x, this.origin.y, this.origin.z],
                axis: axis,
                angle: angle,
                rescale: false // TODO: make changable
            }
        };
        
        Element.prototype.sizeX = function(value) {
            if (angular.isDefined(value)) {
                this.size.x = value;
                this.createGeometry(true);
            } else {
                return this.size.x;
            }
        }
        
        Element.prototype.sizeY = function(value) {
            if (angular.isDefined(value)) {
                this.size.y = value;
                this.createGeometry(true);
            } else {
                return this.size.y;
            }
        }
        
        Element.prototype.sizeZ = function(value) {
            if (angular.isDefined(value)) {
                this.size.z = value;
                this.createGeometry(true);
            } else {
                return this.size.z;
            }
        }
        
        Element.prototype.positionX = function(value) {
            if (angular.isDefined(value)) {
                this.position.x = value;
                this.mesh.position.x = this.position.x;
            } else {
                return this.position.x;
            }
        }
        
        Element.prototype.positionY = function(value) {
            if (angular.isDefined(value)) {
                this.position.y = value;
                this.mesh.position.y = this.position.y;
            } else {
                return this.position.y;
            }
        }
        
        Element.prototype.positionZ = function(value) {
            if (angular.isDefined(value)) {
                this.position.z = value;
                this.mesh.position.z = this.position.z;
            } else {
                return this.position.z;
            }
        }
        
        Element.prototype.rotationX = function(value) {
            if (angular.isDefined(value)) {
                this.rotation.x = value;
                this.createGeometry(true);
            } else {
                return this.rotation.x;
            }
        }
        
        Element.prototype.rotationY = function(value) {
            if (angular.isDefined(value)) {
                this.rotation.y = value;
                this.createGeometry(true);
            } else {
                return this.rotation.y;
            }
        }
        
        Element.prototype.rotationZ = function(value) {
            if (angular.isDefined(value)) {
                this.rotation.z = value;
                this.createGeometry(true);
            } else {
                return this.rotation.z;
            }
        }
        
        Element.prototype.canRotateX = function(value) {
            return this.rotation.y == 0 && this.rotation.z == 0;
        }
        
        Element.prototype.canRotateY = function(value) {
            return this.rotation.x == 0 && this.rotation.z == 0;
        }
        
        Element.prototype.canRotateZ = function(value) {
            return this.rotation.x == 0 && this.rotation.y == 0;
        }
        
        Element.prototype.originX = function(value) {
            if (angular.isDefined(value)) {
                this.origin.x = value;
                this.createGeometry(true);
            } else {
                return this.origin.x;
            }
        }
        
        Element.prototype.originY = function(value) {
            if (angular.isDefined(value)) {
                this.origin.y = value;
                this.createGeometry(true);
            } else {
                return this.origin.y;
            }
        }
        
        Element.prototype.originZ = function(value) {
            if (angular.isDefined(value)) {
                this.origin.z = value;
                this.createGeometry(true);
            } else {
                return this.origin.z;
            }
        }

        return Element;
    }())
}

var mc;

var app = angular.module("mcmodelcreator", []);
app.controller("ModelController", function() {
    var editor = this;
    mc = editor;

    /** VARIABLES */

    editor.elementIndex = 0;
    editor.elements = [];
    editor.name = "";

    editor.validSelection = function() {
        return typeof editor.elementIndex == "number" && editor.elementIndex >= 0 && editor.elementIndex < editor.elements.length;
    }
    
    editor.selected = function() {
        if (!editor.validSelection())
            return {};
        return editor.elements[editor.elementIndex];
    }

    function ctor() {
        editor.size = {
            width: $("#editor").innerWidth(),
            height: 500
        };

        editor.three = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, editor.size.width / editor.size.height, 0.1, 1000),
            renderer: (editor.isWebGlAvailable() ? new THREE.WebGLRenderer({
                antialias: true
            }) : new THREE.CanvasRenderer()),
            lights: [],
            axis: new THREE.AxisHelper(16)
        };

        editor.three.camera.position.set(-8, 8, 0);

        editor.three.lights[0] = new THREE.DirectionalLight(0xAAAAAA, 0.8);
        editor.three.lights[0].position.set(0, 32, 0);
        editor.three.scene.add(editor.three.lights[0]);

        editor.three.lights[1] = new THREE.DirectionalLight(0xAAAAAA, 0.7);
        editor.three.lights[1].position.set(-16, 0, 0);
        editor.three.scene.add(editor.three.lights[1]);

        editor.three.lights[2] = new THREE.DirectionalLight(0xAAAAAA, 0.6);
        editor.three.lights[2].position.set(0, 0, -16);
        editor.three.scene.add(editor.three.lights[2]);

        editor.three.lights[3] = new THREE.DirectionalLight(0xAAAAAA, 0.5);
        editor.three.lights[3].position.set(16, 0, 0);
        editor.three.scene.add(editor.three.lights[3]);

        editor.three.lights[4] = new THREE.DirectionalLight(0xAAAAAA, 0.4);
        editor.three.lights[4].position.set(0, 0, 16);
        editor.three.scene.add(editor.three.lights[4]);

        editor.three.lights[5] = new THREE.DirectionalLight(0xAAAAAA, 0.3);
        editor.three.lights[5].position.set(0, -16, 0);
        editor.three.scene.add(editor.three.lights[5]);

        editor.three.camera.lookAt(new THREE.Vector3(0, 0, 0));
        editor.three.controls = new THREE.OrbitControls(editor.three.camera, editor.three.renderer.domElement);

        editor.three.renderer.setClearColor(0xEEEEEE);
        editor.three.renderer.setSize(editor.size.width, editor.size.height);

        editor.domElement = editor.three.renderer.domElement;

        editor.grid = [];
        for (var i = 0; i < 9; i++) {
            editor.grid[i] = new THREE.GridHelper(8, 1);
            if (i > 0) {
                editor.grid[i].setColors(0xDDDDDD, 0xDDDDDD);
            } else {
                editor.grid[i].setColors(0x888888, 0x888888);
            }
            editor.three.scene.add(editor.grid[i]);
        }

        editor.grid[0].position.set(8, 0, 8);
        editor.grid[1].position.set(-8, 0, 8);
        editor.grid[2].position.set(-8, 0, 24);
        editor.grid[3].position.set(8, 0, 24);
        editor.grid[4].position.set(24, 0, 24);
        editor.grid[5].position.set(24, 0, 8);
        editor.grid[6].position.set(24, 0, -8);
        editor.grid[7].position.set(8, 0, -8);
        editor.grid[8].position.set(-8, 0, -8);

        editor.three.axis.position.set(0, 0.01, 0);
        editor.three.scene.add(editor.three.axis);
    }

    editor.isWebGlAvailable = function() {
        try {
            var canvas = document.createElement("canvas");
            return !!
                    window.WebGLRenderingContext &&
                (canvas.getContext("webgl") ||
                canvas.getContext("experimental-webgl"));
        } catch(e) {
            return false;
        }
    };

    editor.setSize = function(width, height) {
        editor.size.width = width;
        editor.size.height = height;

        editor.three.renderer.setSize(width, height);
    };

    editor.startRendering = function() {
        function render() {
            requestAnimationFrame(render);

            editor.three.renderer.render(
                editor.three.scene,
                editor.three.camera
            );
        }
        render();
    };

    editor.newElement = function(size, position, rotation) {
        editor.elements.push(new ModelCreator.Element(
            size || new THREE.Vector3(1, 1, 1),
            position || new THREE.Vector3(0, 0, 0),
            rotation || new THREE.Vector3(0, 0, 0)
        ));

        editor.three.scene.add(editor.elements[editor.elements.length - 1].mesh);
        editor.elementIndex = editor.elements.length - 1;
        editor.elementIndexRaw = editor.elements.length - 1;
        return editor.elements.length - 1;
    };

    editor.removeElement = function(index) {
        editor.three.scene.remove(editor.elements[index].mesh);
        editor.elements.splice(index, 1);
    };
    
    editor.removeSelected = function() {
        if (!editor.validSelection())
            return;
        editor.removeElement(editor.elementIndex);
        editor.elementIndex = -1;
        editor.elementIndexRaw = "";
    };

    editor.duplicateElement = function(index) {
        if (index >= 0 && index < editor.elements.length) {
            var newIndex = editor.newElement(
                editor.elements[index].size,
                editor.elements[index].position,
                editor.elements[index].rotation
            );

            editor.elements[newIndex].name = editor.elements[index].name + " (Copy)";

            return newIndex;
        }
    };
    
    editor.duplicateSelected = function() {
        if (!editor.validSelection())
            return;
        return editor.elementIndex = editor.elementIndexRaw = editor.duplicateElement(editor.elementIndex);
    };

    editor._save = function(name) {
        name = name || editor.modelName || "autosave";
        var object = {
            __name: name,
            textures: editor.textureVariables,
            ambientocclusion: true,
            display: { },
            elements: []
        };
        for (var i = 0; i < editor.elements.length; i++) {
            object.elements.push(editor.elements[i].serialize());
        }
        window.localStorage.setItem("model." + name, JSON.stringify(object));
    };

    editor._load = function(name) {
        name = name || editor.modelName || "autosave";
        editor.modelName = name;
        var elements = [];
        var serialized = JSON.parse(window.localStorage.getItem("model." + name) || "{\"elements\":[]}");
        editor.textureVariables = serialized.textures;
        for (var i = 0; i < serialized.elements.length; i++) {
            elements.push(ModelCreator.Element.deserialize(serialized.elements[i]));
        }
        editor.elements = elements;
    };

    ctor();
    editor.domElement.style.borderRadius = "4px";
    $("#editor").append(editor.domElement);

    editor.startRendering();

    /** SAVING */

    editor.save = function() {
        if (!editor.modelName) {
            while (true) {
                editor.modelName = prompt("Enter model name");
                if (window.localStorage.getItem("model." + editor.modelName)) {
                    if (confirm("A model with this name already exists. Overwrite it?"))
                        break;
                    else
                        continue;
                }
                break;
            }
        }
        editor._save();
    }

    setInterval(editor._save.bind(editor), 5000); // TODO: Make interval changable

    $(window).on("keydown", function(e) {
        if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
            e.preventDefault();
            editor.save();
        }
    });
});

/** TABS */

$(".nav-tabs a").click(function() {
    $(this).tab("show");
});
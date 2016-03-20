
ModelCreator = (function() {
    function ModelCreator(width, height) {
        this.size = {
            width: width,
            height: height
        };

        this.three = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 1000),
            renderer: (this.isWebGlAvailable() ? new THREE.WebGLRenderer({
                antialias: true
            }) : new THREE.CanvasRenderer()),
            // renderer: new THREE.CanvasRenderer(),
            lights: [],
            axis: new THREE.AxisHelper(16)
        };

        this.three.camera.position.set(-8, 8, 0);

        this.three.lights[0] = new THREE.DirectionalLight(0xAAAAAA, 0.8);
        this.three.lights[0].position.set(0, 32, 0);
        this.three.scene.add(this.three.lights[0]);

        this.three.lights[1] = new THREE.DirectionalLight(0xAAAAAA, 0.7);
        this.three.lights[1].position.set(-16, 0, 0);
        this.three.scene.add(this.three.lights[1]);

        this.three.lights[2] = new THREE.DirectionalLight(0xAAAAAA, 0.6);
        this.three.lights[2].position.set(0, 0, -16);
        this.three.scene.add(this.three.lights[2]);

        this.three.lights[3] = new THREE.DirectionalLight(0xAAAAAA, 0.5);
        this.three.lights[3].position.set(16, 0, 0);
        this.three.scene.add(this.three.lights[3]);

        this.three.lights[4] = new THREE.DirectionalLight(0xAAAAAA, 0.4);
        this.three.lights[4].position.set(0, 0, 16);
        this.three.scene.add(this.three.lights[4]);

        this.three.lights[5] = new THREE.DirectionalLight(0xAAAAAA, 0.3);
        this.three.lights[5].position.set(0, -16, 0);
        this.three.scene.add(this.three.lights[5]);

        this.three.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.three.controls = new THREE.OrbitControls(this.three.camera, this.three.renderer.domElement);

        this.three.renderer.setClearColor(0xEEEEEE);
        this.three.renderer.setSize(width, height);

        this.element = this.three.renderer.domElement;

        this.modelName = "";

        this.grid = [];
        for (var i = 0; i < 9; i++) {
            this.grid[i] = new THREE.GridHelper(8, 1);
            if (i > 0) {
                this.grid[i].setColors(0xDDDDDD, 0xDDDDDD);
            } else {
                this.grid[i].setColors(0x888888, 0x888888);
            }
            this.three.scene.add(this.grid[i]);
        }

        this.grid[0].position.set(8, 0, 8);
        this.grid[1].position.set(-8, 0, 8);
        this.grid[2].position.set(-8, 0, 24);
        this.grid[3].position.set(8, 0, 24);
        this.grid[4].position.set(24, 0, 24);
        this.grid[5].position.set(24, 0, 8);
        this.grid[6].position.set(24, 0, -8);
        this.grid[7].position.set(8, 0, -8);
        this.grid[8].position.set(-8, 0, -8);

        this.three.axis.position.set(0, 0.01, 0);
        this.three.scene.add(this.three.axis);

        this.elements = [];
    }

    ModelCreator.prototype.isWebGlAvailable = function() {
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

    ModelCreator.prototype.setSize = function(width, height) {
        this.size.width = width;
        this.size.height = height;

        this.three.renderer.setSize(width, height);
    };

    ModelCreator.prototype.startRendering = function() {
        var self = this;
        function render() {
            requestAnimationFrame(render);

            self.three.renderer.render(
                self.three.scene,
                self.three.camera
            );
        }
        render();
    };

    ModelCreator.prototype.newElement = function(size, position, rotation) {
        this.elements.push(new ModelCreator.Element(
            size || new THREE.Vector3(1, 1, 1),
            position || new THREE.Vector3(0, 0, 0),
            rotation || new THREE.Vector3(0, 0, 0)
        ));

        this.three.scene.add(this.elements[this.elements.length - 1].mesh);
        return this.elements.length - 1;
    };

    ModelCreator.prototype.removeElement = function(index) {
        if (index >= 0 && index < this.elements.length) {
            this.three.scene.remove(this.elements[index].mesh);
            this.elements.pop(index);
        }
    };

    ModelCreator.prototype.duplicateElement = function(index) {
        if (index >= 0 && index < this.elements.length) {
            var newIndex = this.newElement(
                this.elements[index].size,
                this.elements[index].position,
                this.elements[index].rotation
            );

            this.elements[newIndex].name = this.elements[index].name + " (Copy)";

            return newIndex;
        }
    };

    ModelCreator.prototype.save = function(name) {
        name = name || this.modelName || "autosave";
        var object = {
            __name: name,
            textures: this.textureVariables,
            ambientocclusion: true,
            display: { },
            elements: []
        };
        for (var i = 0; i < this.elements.length; i++) {
            object.elements.push(this.elements[i].serialize());
        }
        window.localStorage.setItem("model." + name, JSON.stringify(object));
    };

    ModelCreator.prototype.load = function(name) {
        name = name || this.modelName || "autosave";
        this.modelName = name;
        var elements = [];
        var serialized = JSON.parse(window.localStorage.getItem("model." + name) || "{\"elements\":[]}");
        this.textureVariables = serialized.textures;
        for (var i = 0; i < serialized.elements.length; i++) {
            elements.push(ModelCreator.Element.deserialize(serialized.elements[i]));
        }
        this.elements = elements;
    };

    ModelCreator.Element = (function() {
        /**
         *
         * @param {THREE.Vector3} size
         * @param {THREE.Vector3} position
         * @param {THREE.Vector3} rotation
         * @param {THREE.Vector3} origin
         * @constructor
         */
        function Element(size, position, rotation, origin) {
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
            this.geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);

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

        return Element;
    }());

    return ModelCreator;
}());

var mc = new ModelCreator($("#editor").innerWidth(), 500);
mc.element.style.borderRadius = "4px";
$("#editor").append(mc.element);

mc.startRendering();

/** VARIABLES */
var currentElement = null;

/** CONTROLS */

$("#elemName").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].name = $("#elemName").val();
        updateElementList();
    }
});
$("#elemSizeX").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setSize(
            new THREE.Vector3(
                parseFloat($("#elemSizeX").val()),
                mc.elements[currentElement].size.y,
                mc.elements[currentElement].size.z
            )
        );
    }
});
$("#elemSizeY").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setSize(
            new THREE.Vector3(
                mc.elements[currentElement].size.x,
                parseFloat($("#elemSizeY").val()),
                mc.elements[currentElement].size.z
            )
        );
    }
});
$("#elemSizeZ").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setSize(
            new THREE.Vector3(
                mc.elements[currentElement].size.x,
                mc.elements[currentElement].size.y,
                parseFloat($("#elemSizeZ").val())
            )
        );
    }
});
$("#elemPosX").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setPosition(
            new THREE.Vector3(
                parseFloat($("#elemPosX").val()),
                mc.elements[currentElement].position.y,
                mc.elements[currentElement].position.z
            )
        );
    }
});
$("#elemPosY").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setPosition(
            new THREE.Vector3(
                mc.elements[currentElement].position.x,
                parseFloat($("#elemPosY").val()),
                mc.elements[currentElement].position.z
            )
        );
    }
});
$("#elemPosZ").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setPosition(
            new THREE.Vector3(
                mc.elements[currentElement].position.x,
                mc.elements[currentElement].position.y,
                parseFloat($("#elemPosZ").val())
            )
        );
    }
});
$("#elemRotX").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setRotation(
            new THREE.Vector3(
                parseFloat($("#elemRotX").val()),
                mc.elements[currentElement].rotation.y,
                mc.elements[currentElement].rotation.z
            )
        );
        updateRotations();
    }
});
$("#elemRotY").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setRotation(
            new THREE.Vector3(
                mc.elements[currentElement].rotation.x,
                parseFloat($("#elemRotY").val()),
                mc.elements[currentElement].rotation.z
            )
        );
        updateRotations();
    }
});
$("#elemRotZ").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setRotation(
            new THREE.Vector3(
                mc.elements[currentElement].rotation.x,
                mc.elements[currentElement].rotation.y,
                parseFloat($("#elemRotZ").val())
            )
        );
        updateRotations();
    }
});
$("#elemOriX").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setOrigin(
            new THREE.Vector3(
                parseFloat($("#elemOriX").val()),
                mc.elements[currentElement].origin.y,
                mc.elements[currentElement].origin.z
            )
        );
    }
});
$("#elemOriY").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setOrigin(
            new THREE.Vector3(
                mc.elements[currentElement].origin.x,
                parseFloat($("#elemOriY").val()),
                mc.elements[currentElement].origin.z
            )
        );
    }
});
$("#elemOriZ").on("change keydown keyup", function() {
    if (currentElement != null) {
        mc.elements[currentElement].setOrigin(
            new THREE.Vector3(
                mc.elements[currentElement].origin.x,
                mc.elements[currentElement].origin.y,
                parseFloat($("#elemOriZ").val())
            )
        );
    }
});

function updateRotations() {
    if (currentElement != null) {
        if ($("#elemRotX").val() != 0) {
            $("#elemRotY").prop("disabled", true);
            $("#elemRotZ").prop("disabled", true);
        } else if ($("#elemRotY").val() != 0) {
            $("#elemRotX").prop("disabled", true);
            $("#elemRotZ").prop("disabled", true);
        } else if ($("#elemRotZ").val() != 0) {
            $("#elemRotX").prop("disabled", true);
            $("#elemRotY").prop("disabled", true);
        } else {
            $("#elemRotX").prop("disabled", false);
            $("#elemRotY").prop("disabled", false);
            $("#elemRotZ").prop("disabled", false);
        }
    }
}

function updateControls() {
    if (currentElement != null) {
        $("#elemName").prop("disabled", false);
        $("#elemSizeX").prop("disabled", false);
        $("#elemSizeY").prop("disabled", false);
        $("#elemSizeZ").prop("disabled", false);
        $("#elemPosX").prop("disabled", false);
        $("#elemPosY").prop("disabled", false);
        $("#elemPosZ").prop("disabled", false);
        $("#elemRotX").prop("disabled", false);
        $("#elemRotY").prop("disabled", false);
        $("#elemRotZ").prop("disabled", false);
        $("#elemOriX").prop("disabled", false);
        $("#elemOriY").prop("disabled", false);
        $("#elemOriZ").prop("disabled", false);

        $("#elemName").val(mc.elements[currentElement].name);
        $("#elemSizeX").val(mc.elements[currentElement].size.x);
        $("#elemSizeY").val(mc.elements[currentElement].size.y);
        $("#elemSizeZ").val(mc.elements[currentElement].size.z);
        $("#elemPosX").val(mc.elements[currentElement].mesh.position.x);
        $("#elemPosY").val(mc.elements[currentElement].mesh.position.y);
        $("#elemPosZ").val(mc.elements[currentElement].mesh.position.z);
        $("#elemRotX").val(mc.elements[currentElement].mesh.rotation.x);
        $("#elemRotY").val(mc.elements[currentElement].mesh.rotation.y);
        $("#elemRotZ").val(mc.elements[currentElement].mesh.rotation.z);
        $("#elemOriX").val(mc.elements[currentElement].origin.x);
        $("#elemOriY").val(mc.elements[currentElement].origin.y);
        $("#elemOriZ").val(mc.elements[currentElement].origin.z);

        updateRotations();
    } else {
        $("#elemName").prop("disabled", true);
        $("#elemSizeX").prop("disabled", true);
        $("#elemSizeY").prop("disabled", true);
        $("#elemSizeZ").prop("disabled", true);
        $("#elemPosX").prop("disabled", true);
        $("#elemPosY").prop("disabled", true);
        $("#elemPosZ").prop("disabled", true);
        $("#elemRotX").prop("disabled", true);
        $("#elemRotY").prop("disabled", true);
        $("#elemRotZ").prop("disabled", true);

        $("#elemName").val("");
        $("#elemSizeX").val(null);
        $("#elemSizeY").val(null);
        $("#elemSizeZ").val(null);
        $("#elemPosX").val(null);
        $("#elemPosY").val(null);
        $("#elemPosZ").val(null);
        $("#elemRotX").val(0);
        $("#elemRotY").val(0);
        $("#elemRotZ").val(0);
        $("#elemOriX").val(null);
        $("#elemOriY").val(null);
        $("#elemOriZ").val(null);
    }
}

/** ELEMENT LIST */

function updateElementList() {
    $("#lstElements").html("");
    for (var i = 0; i < mc.elements.length; i++) {
        var option = document.createElement("option");
        if (currentElement == i) {
            option.selected = true;
        }
        option.value = i;
        option.innerHTML = mc.elements[i].name;
        $("#lstElements").append(option);
    }
}

$("#lstElements").change(function(event) {
    currentElement = $("#lstElements option:selected").val();
    updateControls();
});

/** BUTTONS */

$("#btnNew").on("click", function() {
    mc.newElement();
    updateElementList();
});
$("#btnRem").on("click", function() {
    mc.removeElement(currentElement);
    currentElement = null;

    updateElementList();
    updateControls();
});
$("#btnDup").on("click", function() {
    currentElement = mc.duplicateElement(currentElement);

    updateElementList();
    updateControls();
});
$("#btnSave").on("click", function() {
    manualSave();
});

function manualSave() {
    if (!mc.modelName) {
        while (true) {
            mc.modelName = prompt("Enter model name");
            if (window.localStorage.getItem("model." + mc.modelName)) {
                if (confirm("A model with this name already exists. Overwrite it?"))
                    break;
                else
                    continue;
            }
            break;
        }
    }
    mc.save();
}

setInterval(mc.save.bind(mc), 5000); // TODO: Make interval changable

$(window).on("keydown", function(e) {
    if (e.ctrlKey && e.keyCode == 'S'.charCodeAt(0)) {
        e.preventDefault();
        manualSave();
    }
});
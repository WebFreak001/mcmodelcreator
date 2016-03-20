
ModelCreator = (function() {
    function ModelCreator(width, height) {
        this.size = {
            width: width,
            height: height
        };

        this.three = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, this.size.width / this.size.height, 0.1, 1000),
            renderer: new THREE.WebGLRenderer({
                antialias: false
            }),
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

        this.workspaces = [];
        for (var i = 0; i < 9; i++) {
            this.workspaces[i] = new THREE.GridHelper(8, 1);
            if (i > 0) {
                this.workspaces[i].setColors(0xDDDDDD, 0xDDDDDD);
            } else {
                this.workspaces[i].setColors(0x888888, 0x888888);
            }
            this.three.scene.add(this.workspaces[i]);
        }

        this.workspaces[0].position.set(8, 0, 8);
        this.workspaces[1].position.set(-8, 0, 8);
        this.workspaces[2].position.set(-8, 0, 24);
        this.workspaces[3].position.set(8, 0, 24);
        this.workspaces[4].position.set(24, 0, 24);
        this.workspaces[5].position.set(24, 0, 8);
        this.workspaces[6].position.set(24, 0, -8);
        this.workspaces[7].position.set(8, 0, -8);
        this.workspaces[8].position.set(-8, 0, -8);

        this.three.axis.position.set(0, 0.01, 0);
        this.three.scene.add(this.three.axis);

        this.elements = [];
    }

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

    ModelCreator.Element = (function() {
        /**
         *
         * @param {THREE.Vector3} size
         * @param {THREE.Vector3} position
         * @constructor
         */
        function Element(size, position, rotation) {
            this.size = size;
            this.position = position;
            this.rotation = rotation;
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

        /**
         *
         * @param {boolean} setMesh
         */
        Element.prototype.createGeometry = function(setMesh) {
            this.geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);

            this.geometry.applyMatrix(
                new THREE.Matrix4().makeTranslation(8, 8, 8)
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

            // this.geometry.applyMatrix(
            //     new THREE.Matrix4().makeTranslation(
            //         -(8 - (this.size.x / 2)),
            //         -(8 - (this.size.y / 2)),
            //         -(8 - (this.size.z / 2))
            //     )
            // );

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
$("#elemSizeZ").on("change keydown keydown", function() {
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
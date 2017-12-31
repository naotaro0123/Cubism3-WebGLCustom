/*
 * Copyright(c) Live2D Inc. All rights reserved.
 * 
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at http://live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */


namespace LIVE2DCUBISMFRAMEWORK {
    /** Cubism animation point. */
    export class AnimationPoint {
        /**
         * Initializes point.
         * 
         * @param time Timing.
         * @param value Value at time.
         */
        public constructor(public time: number, public value: number) {}
    }


    /** Cubism animation segment evaluator. */
    export interface IAnimationSegmentEvaluator {
        /**
         * Evaluates segment.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        (points: Array<AnimationPoint>, offset: number, time: number): number;
    }


    /** Builtin Cubism animation segment evaluators. */
    export class BuiltinAnimationSegmentEvaluators {
        /**
         * Linear segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        public static LINEAR: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            let p0 = points[offset + 0];
            let p1 = points[offset + 1];
            let t = (time - p0.time) / (p1.time - p0.time);


            return (p0.value + ((p1.value - p0.value) * t));
        }

        /**
         * Bézier segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        public static BEZIER: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            let t = (time - points[offset + 0].time) / (points[offset + 3].time - points[offset].time);


            let p01 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 0], points[offset + 1], t);
            let p12 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 1], points[offset + 2], t);
            let p23 = BuiltinAnimationSegmentEvaluators.lerp(points[offset + 2], points[offset + 3], t);

            let p012 = BuiltinAnimationSegmentEvaluators.lerp(p01, p12, t);
            let p123 = BuiltinAnimationSegmentEvaluators.lerp(p12, p23, t);


            return BuiltinAnimationSegmentEvaluators.lerp(p012, p123, t).value;
        }

        /**
         * Stepped segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluationr result.
         */
        public static STEPPED: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            return points[offset + 0].value;
        }

        /**
         * Inverse-stepped segment evaluator.
         * 
         * @param points Points.
         * @param offset Offset into points.
         * @param time Time to evaluate at.
         * 
         * @return Evaluationr result.
         */
        public static INVERSE_STEPPED: IAnimationSegmentEvaluator = function(points: Array<AnimationPoint>, offset: number, time: number): number {
            return points[offset + 1].value;
        }


        /**
         * Interpolates points.
         * 
         * @param a First point.
         * @param b Second point.
         * @param t Weight.
         * 
         * @return Interpolation result.
         */
        private static lerp(a: AnimationPoint, b: AnimationPoint, t: number): AnimationPoint {

              return new AnimationPoint((a.time + ((b.time - a.time) * t)), (a.value + ((b.value - a.value) * t)));
        }
    }


    /** Cubism animation track segment. */
    export class AnimationSegment {
        /**
         * Initializes instance.
         *
         * @param offset Offset into points.
         * @param evaluate Evaluator.
         */
        public constructor(public offset: number, public evaluate: IAnimationSegmentEvaluator) {}
    }


    /** Cubism animation track. */
    export class AnimationTrack {
        /**
         * Initializes instance.
         * 
         * @param targetId Target ID.
         * @param points Points.
         * @param segments Segments.
         */
        public constructor(public targetId: string, public points: Array<AnimationPoint>, public segments: Array<AnimationSegment>) {}
        

        /**
         * Evaluates track
         * 
         * @param time Time to evaluate at.
         * 
         * @return Evaluation result.
         */
        public evaluate(time: number): number {
            // Find segment to evaluate.
            let s = 0;
            let lastS = this.segments.length - 1;


            for(; s < lastS; ++s) {
                if (this.points[this.segments[s + 1].offset].time < time) {
                    continue;
                }


                break;
            }


            // Evaluate segment.
            // TODO Passing segment offset somewhat to itself is awkward. Improve it?
            return this.segments[s].evaluate(this.points, this.segments[s].offset, time);
        }
    }


    /** Cubism animation. */
    export class Animation {
        /**
         * Deserializes animation from motion3.json.
         * 
         * @param motion3Json Parsed motion3.json
         * 
         * @return Animation on success; 'null' otherwise. 
         */
        public static fromMotion3Json(motion3Json: any): Animation {
            if (motion3Json == null) {
                return null;
            }


            let animation = new Animation(motion3Json);


            return (animation.isValid)
                ? animation
                : null;
        }


        /** Duration (in seconds). */
        public duration: number;

        /** Fps. */
        public fps: number;

        /** Loop control. */
        public loop: boolean;

        /** Model tracks. */
        public modelTracks: Array<AnimationTrack> = new Array<AnimationTrack>();

        /** Parameter tracks. */
        public parameterTracks: Array<AnimationTrack> = new Array<AnimationTrack>();

        /** Part opacity tracks. */
        public partOpacityTracks: Array<AnimationTrack> = new Array<AnimationTrack>();


        /**
         * Evaluates animation.
         * 
         * @param time Time. 
         * @param weight Weight.
         * @param blend Blender.
         * @param target Target.
         */
        public evaluate(time: number, weight: number, blend: IAnimationBlender, target: LIVE2DCUBISMCORE.Model): void {
            // Return early if influence is miminal.
            if (weight <= 0.01) {
                return;
            }


            // Loop animation time if requested.
            if (this.loop) {
                while (time > this.duration) {
                    time -= this.duration;
                }
            }


            // Evaluate tracks and apply results.
            this.parameterTracks.forEach((t) => {
                let p = target.parameters.ids.indexOf(t.targetId);


                if (p >= 0) {
                    let sample = t.evaluate(time);


                    target.parameters.values[p] = blend(target.parameters.values[p], sample, weight);
                }
            });


            this.partOpacityTracks.forEach((t) => {
                let p = target.parts.ids.indexOf(t.targetId);


                if (p >= 0) {
                    let sample = t.evaluate(time);


                    target.parts.opacities[p] = blend(target.parts.opacities[p], sample, weight);
                }
            });
            
            
            // TODO Evaluate model tracks.
        }


        /** 'true' if instance is valid; 'false' otherwise. */
        private get isValid(): boolean {
            return true;
        }


        /**
         * Creates instance.
         * 
         * @param motion3Json Parsed motion3.json.
         */
        private constructor(motion3Json: any) {
            // Deserialize meta.
            this.duration = motion3Json['Meta']['Duration'];
            this.fps = motion3Json['Meta']['Fps'];
            this.loop = motion3Json['Meta']['Loop'];


            // Deserialize tracks.
            motion3Json['Curves'].forEach((c: any) => {
                // Deserialize segments.
                let s = c['Segments'];


                let points = new Array<AnimationPoint>();
                let segments = new Array<AnimationSegment>();


                points.push(new AnimationPoint(s[0], s[1]));


                for (var t = 2; t < s.length; t += 3) {
                    let offset = points.length - 1;
                    let evaluate = BuiltinAnimationSegmentEvaluators.LINEAR;
                    
            
                    // Handle segment types.
                    let type = s[t];

                    if (type == 1) {
                        evaluate = BuiltinAnimationSegmentEvaluators.BEZIER;


                        points.push(new AnimationPoint(s[t + 1], s[t + 2]));
                        points.push(new AnimationPoint(s[t + 3], s[t + 4]));


                        t += 4;
                    }
                    else if (type == 2) {
                        evaluate = BuiltinAnimationSegmentEvaluators.STEPPED;
                    }
                    else if (type == 3) {
                        evaluate = BuiltinAnimationSegmentEvaluators.INVERSE_STEPPED;
                    }
                    else if (type != 0) {
                        // TODO Handle unexpected segment type.
                    }


                    // Push segment and point.
                    points.push(new AnimationPoint(s[t + 1], s[t + 2]));
                    segments.push(new AnimationSegment(offset, evaluate));
                }


                // Create track.
                let track = new AnimationTrack(c['Id'], points, segments);


                // Push track.
                if (c['Target'] == 'Model') {
                    this.modelTracks.push(track);
                }
                else if (c['Target'] == 'Parameter') {
                    this.parameterTracks.push(track);
                }
                else if (c['Target'] == 'PartOpacity') {
                    this.partOpacityTracks.push(track);
                }
                else {
                    // TODO Handle unexpected target.
                }
            });
        }
    }


    /** Cubism animation cross-fade weighter. */
    export interface IAnimationCrossfadeWeighter {
        /**
         * Weights crossfade.
         * 
         * @param time Current fade time.
         * @param duration Total fade duration.
         * 
         * @return Normalized source weight. (Destination will be weight as (1 - source weight)).
         */
        (time: number, duration: number): number;
    }


    /** Builtin Cubims crossfade  */
    export class BuiltinCrossfadeWeighters {
        /**
         * Linear crossfade weighter.
         *  
         * @param time Current fade time.
         * @param duration Total fade duration.
         * 
         * @return Normalized source weight. (Destination will be weight as (1 - source weight)).
         */
        public static LINEAR(time: number, duration: number): number {
            return (time / duration);
        } 
    }


    /** Cubism animation state. */
    export class AnimationState {
        /** Time. */
        public time: number;
    }


    /** Cubism animation layer blender. */
    export interface IAnimationBlender {
        /**
         * Blends.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        (source: number, destination: number, weight: number): number;
    }


    /** Builtin Cubism animation layer blenders. */
    export class BuiltinAnimationBlenders {
        /**
         * Override blender.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        public static OVERRIDE: IAnimationBlender = function(source: number, destination: number, weight: number): number {
            return (destination * weight);
        }

        /**
         * Additive blender.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        public static ADD: IAnimationBlender = function(source: number, destination: number, weight: number): number {
            return (source + (destination * weight));
        }

        /**
         * Multiplicative blender.
         * 
         * @param source Source value.
         * @param destination Destination value.
         * @param weight Weight.
         *  
         * @return Blend result.
         */
        public static MULTIPLY: IAnimationBlender = function(source: number, destination: number, weight: number): number {
            return (source * (1 + ((destination - 1) * weight)));
        }
    }


    /** Cubism animation layer. */
    export class AnimationLayer {
        /** Current animation. */
        public get currentAnimation(): Animation {
            return this._animation;
        }

        /** Current time. */
        public get currentTime(): number {
            return this._time;
        }
        public set currentTime(value: number) {
            this._time = value;
        }

        /** Blender. */
        public blend: IAnimationBlender;

        /** Crossfade weighter. */
        public weightCrossfade: IAnimationCrossfadeWeighter;

        /** Normalized weight. */
        public weight: number = 1;

        /** 'true' if layer is playing; 'false' otherwise. */
        public get isPlaying(): boolean {
            return this._play;
        }


        /**
         * Starts playing animation.
         *
         * @param animation Animation to play.
         */
        public play(animation: Animation, fadeDuration: number = 0): void {
            if (this._animation && fadeDuration > 0) {
                this._goalAnimation = animation;
                this._goalTime = 0;

                this._fadeTime = 0;
                this._fadeDuration = fadeDuration;
            }
            else {
                this._animation = animation;
                this.currentTime = 0;
                this._play = true;
            }
        }

        /** Resumes playback. */
        public resume(): void {
            this._play = true;
        }
        
        /** Pauses playback (preserving time). */
        public pause(): void {
            this._play = false;
        }

        /** Stops playback (resetting time). */
        public stop(): void {
            this._play = false;
            this.currentTime = 0
        }


        /** Current animation. */
        private _animation: Animation;

        /** Time of current animation. */
        private _time: number;

        /** Goal animation. */
        private _goalAnimation: Animation;

        /** Goal animation time. */
        private _goalTime: number;

        /** Crossfade time. */
        private _fadeTime: number;

        /** Crossfade duration. */
        private _fadeDuration: number;

        /** Controls playback. */
        private _play: boolean;


        /**
         * Ticks layer.
         *
         * @param deltaTime Time delta.
         */
        public _update(deltaTime: number): void {
            // Return if not playing.
            if (!this._play) {
                return;
            }


            // Progress time if playing.
            this._time += deltaTime;
            this._goalTime += deltaTime;
            this._fadeTime += deltaTime;
        }

        /**
         * Applies results to [[target]].
         * 
         * @param target Target.
         */
        public _evaluate(target: LIVE2DCUBISMCORE.Model): void {
            // Return if evaluation isn't possible.
            if (this._animation == null) {
                return;
            }


            // Clamp weight.
            let weight = (this.weight < 1)
                ? this.weight
                : 1;


            // Evaluate current animation.
            let animationWeight = (this._goalAnimation != null)
                ? (weight * this.weightCrossfade(this._fadeTime, this._fadeDuration))
                : weight;


            this._animation.evaluate(this._time, animationWeight, this.blend, target);


            // Evaluate goal animation.
            if (this._goalAnimation != null) {
                animationWeight = 1 - (weight * this.weightCrossfade(this._fadeTime, this._fadeDuration));


                this._goalAnimation.evaluate(this._goalTime, animationWeight, this.blend, target);


                // Finalize crossfade.
                if (this._fadeTime > this._fadeDuration) {
                    this._animation = this._goalAnimation;
                    this._time = this._goalTime;
                    this._goalAnimation = null;
                }
            }
        }
    }


    /** Cubism animator. */
    export class Animator {
        /** Target model. */
        public get target(): LIVE2DCUBISMCORE.Model {
            return this._target;
        }

        /** Time scale. */
        public timeScale: number;


        /**
         * Gets layer by name.
         *
         * @param name Name.
         * 
         * @return Animation layer if found; 'null' otherwise.
         */
        public getLayer(name: string): AnimationLayer {
            return this._layers.has(name)
                ? this._layers.get(name)
                : null;
        }


        /** Updates and evaluates animation layers. */
        public updateAndEvaluate(deltaTime: number): void {
            // Scale delta time.
            deltaTime *= ((this.timeScale > 0)
                ? this.timeScale
                : 0);


            // Tick layers.
            if (deltaTime > 0.001) {
                this._layers.forEach((l) => {
                    l._update(deltaTime);
                });
            }


            // Evaluate layers.
            this._layers.forEach((l) => {
                l._evaluate(this._target);
            });
        }


        /**
         * Creates animator.
         * 
         * @param target Target.
         * 
         * @return Animator on success; 'null' otherwise.
         */
        public static _create(target: LIVE2DCUBISMCORE.Model, timeScale: number, layers: Map<string, AnimationLayer>): Animator {
            let animator = new Animator(target, timeScale,layers);


            return animator.isValid
                ? animator
                : null;
        }


        /** Target. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** Layers. */
        private _layers: Map<string, AnimationLayer>;

        /** 'true' if instance is valid; 'false' otherwise. */
        private get isValid(): boolean {
            return this._target != null;
        }


        /**
         * Creates instance.
         * 
         * @param target Target.
         * @param timeScale Time scale.
         * @param layers Layers.
         */
        private constructor(target: LIVE2DCUBISMCORE.Model, timeScale: number, layers: Map<string, AnimationLayer>) {
            this._target = target;
            this.timeScale = timeScale;
            this._layers = layers;
        }
    }


    /** Cubism [[Animator]] builder. */
    export class AnimatorBuilder {
        /**
         * Sets target model.
         *
         * @param value Target.
         * 
         * @return Builder.
         */
        public setTarget(value: LIVE2DCUBISMCORE.Model): AnimatorBuilder {
            this._target = value;


            return this;
        }

        /**
         * Sets time scale.
         *
         * @param value Time scale.
         * 
         * @return Builder.
         */
        public setTimeScale(value: number): AnimatorBuilder {
            this._timeScale = value;


            return this;
        }

        /**
         * Adds layer.
         *
         * @param name Name.
         * @param blender Blender.
         * @param weight Weight.
         * 
         * @return Builder.
         */
        public addLayer(name: string, blender: IAnimationBlender = BuiltinAnimationBlenders.OVERRIDE, weight: number = 1) {
            // TODO Make sure layer name is unique.


            this._layerNames.push(name);
            this._layerBlenders.push(blender);
            this._layerCrossfadeWeighters.push(BuiltinCrossfadeWeighters.LINEAR);
            this._layerWeights.push(weight);


            return this;
        }

        /**
         * Builds [[Animator]].
         * 
         * @return Animator on success; 'null' otherwise.
         */
        public build(): Animator {
            // TODO Validate state.


            // Create layers.
            let layers = new Map<string, AnimationLayer>();


            for (let l = 0; l < this._layerNames.length; ++l) {
                let layer = new AnimationLayer();


                layer.blend = this._layerBlenders[l];
                layer.weightCrossfade = this._layerCrossfadeWeighters[l];
                layer.weight = this._layerWeights[l];


                layers.set(this._layerNames[l], layer);
            }


            // Create animator.
            return Animator._create(this._target, this._timeScale, layers);
        }


        /** Target. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** Time scale. */
        private _timeScale: number = 1;

        /** Layer names. */
        private _layerNames: Array<string> = new Array<string>();

        /** Layer blenders. */
        private _layerBlenders: Array<IAnimationBlender> = new Array<IAnimationBlender>();

        /** Layer crossfade weighters. */
        private _layerCrossfadeWeighters: Array<IAnimationCrossfadeWeighter> = new Array<IAnimationCrossfadeWeighter>();

        /** Layer weights. */
        private _layerWeights: Array<number> = new Array<number>();
    }


    /** Cubism physics 2-component vector. */
    export class PhysicsVector2 {
        /** Zero vector. */
        public static zero: PhysicsVector2 = new PhysicsVector2(0, 0);


        /** Calculates distance between points.
         * 
         * @param a First point.
         * @param b Second point.
         * 
         * @return Distance.
         */
        public static distance(a: PhysicsVector2, b: PhysicsVector2): number {
            return Math.abs(a.substract(b).length);
        }

        /**
         * Calculates dor product.
         * 
         * @param a First vector.
         * @param b Second vector.
         * 
         * @return Dot product.
         */
        public static dot(a: PhysicsVector2, b: PhysicsVector2): number {
            return ((a.x * b.x) + (a.y * b.y));
        }


        /** Length. */
        public get length(): number {
            return Math.sqrt(PhysicsVector2.dot(this, this));
        }


        /**
         * Initializes instance.
         *
         * @param x X component.
         * @param y Y component. 
         */
        public constructor(public x: number, public y: number) {}


        /**
         * Sums vectors.
         * 
         * @param vector2 Other vector.
         * 
         * @return Summed vector.
         */
        public add(vector2: PhysicsVector2): PhysicsVector2 {
            return new PhysicsVector2(this.x + vector2.x, this.y + vector2.y);
        }

        /**
         * Substracts vectors.
         * 
         * @param vector2 Other vector.
         * 
         * @return Result.
         */
        public substract(vector2: PhysicsVector2): PhysicsVector2 {
            return new PhysicsVector2(this.x - vector2.x, this.y - vector2.y);
        }


        /**
         * Multiplies vectors.
         * 
         * @param vector2 Other vector.
         * 
         * @return Result.
         */
        public multiply(vector2: PhysicsVector2): PhysicsVector2 {
            return new PhysicsVector2(this.x * vector2.x, this.y * vector2.y);
        }

        /**
         * Multiplies vector and scalar.
         * 
         * @param scalar Scalar.
         * 
         * @return Result.
         */
        public multiplyByScalar(scalar: number): PhysicsVector2 {
            return this.multiply(new PhysicsVector2(scalar, scalar));
        }


        /**
         * Divides vectors.
         * 
         * @param vector2 Other vector.
         * 
         * @return Result.
         */
        public divide(vector2: PhysicsVector2): PhysicsVector2 {
            return new PhysicsVector2(this.x / vector2.x, this.y / vector2.y);
        }

        /**
         * Divides vector by scalar.
         * 
         * @param scalar Scalar.
         * 
         * @return Result.
         */
        public divideByScalar(scalar: number): PhysicsVector2 {
            return this.divide(new PhysicsVector2(scalar, scalar));
        }


        /**
         * Rotates by radians.
         * 
         * @param radians Radians.
         * 
         * @return Result. 
         */
        public rotateByRadians(radians: number): PhysicsVector2 {
            let x = (this.x * Math.cos(radians)) - (this.y * Math.sin(radians));
            let y = (this.x * Math.sin(radians)) + (this.y * Math.cos(radians));


            return new PhysicsVector2(x, y);
        }


        /**
         * Calculates normalized vector.
         * 
         * @return Result.
         */
        public normalize(): PhysicsVector2 {
            let length = this.length;
            let x = this.x / length;
            let y = this.y / length;


            return new PhysicsVector2(x, y);
        }
    }


    /** Global Cubism physics settings and . */
    export class Physics {
        /** Gravity. */
        public static gravity: PhysicsVector2 = new PhysicsVector2(0, -1);

        /** Wind. */
        public static wind: PhysicsVector2 = new PhysicsVector2(0, 0);

        /** Maximum weight. (Used for normalizing weights). */
        public static maximumWeight: number = 100;

        /** Air resistance. */
        public static airResistance:number = 5;

        /** Movement threshold. */
        public static movementThreshold: number = 0.001;

        /** Controls angle correction. */
        public static correctAngles: boolean = false;


        /**
         * Clamps scalar.
         * 
         * @param scalar Value to clamp.
         * @param lower Lower boundary.
         * @param upper Upper boundary.
         * 
         * @return Clamp result.
         */
        public static clampScalar(scalar: number, lower: number, upper: number): number {
            if (scalar < lower) {
                return lower;
            }
            if (scalar > upper) {
                return upper;
            }
            return scalar;
        }


        /**
         * Converts direction to degrees.
         * 
         * @param from Base vector.
         * @param to Direction vector.
         * 
         * @return Degrees.
         */
        public static directionToDegrees(from: PhysicsVector2, to: PhysicsVector2): number {
            let radians = Physics.directionToRadians(from, to);
            let degrees = Physics.radiansToDegrees(radians);


            return ((to.x - from.x) > 0)
                ? -degrees
                : degrees;
        }

        /**
         * Converts radians to degrees.
         * 
         * @param radians Radians.
         *
         * @return Degrees.
         */
        public static radiansToDegrees(radians: number): number {
            return ((radians * 180) / Math.PI);
        }

        /**
         * Converts radians to direction.
         * 
         * @param radians Radians.
         * 
         * @return Direction.
         */
        public static radiansToDirection(radians: number): PhysicsVector2 {
            return new PhysicsVector2(Math.sin(radians), Math.cos(radians));
        }


        /**
         * Converts degrees to radians.
         * 
         * @param degrees Degrees.
         *
         * @return Radians.
         */
        public static degreesToRadians(degrees: number): number {
            return ((degrees / 180) * Math.PI);
        }


        /**
         * Converts direction to radians.
         * 
         * @param from Base vector.
         * @param to Direction vector.
         * 
         * @return Radians.
         */
        public static directionToRadians(from: PhysicsVector2, to: PhysicsVector2): number {
            let dot = PhysicsVector2.dot(from, to);
            let magnitude = from.length * to.length;


            if (magnitude == 0)
            {
                return 0;
            }

            
            let cosTheta = (dot / magnitude);


            return (Math.abs(cosTheta) <= 1.0)
                ? Math.acos(cosTheta)
                : 0;
        }
    }


    /** Single Cubism physics particle. */
    export class PhysicsParticle {
        /** Current position. */
        public position: PhysicsVector2;

        /** Last position. */
        public lastPosition: PhysicsVector2;

        /** Last gravity? */
        public lastGravity: PhysicsVector2;

        /** Current force. */
        public force: PhysicsVector2;

        /** Current velocity. */
        public velocity: PhysicsVector2;

        
        /**
         * Initializes instance.
         * 
         * @param initialPosition Initial position.
         * @param mobility Mobility.
         * @param delay Delay.
         * @param acceleration Acceleration.
         * @param radius Radius.
         */
        public constructor(public initialPosition: PhysicsVector2, public mobility: number, public delay: number, public acceleration: number, public radius: number) {
            this.position = initialPosition;
            this.lastPosition = this.position;
            this.lastGravity = new PhysicsVector2(0, -1);
            this.force = new PhysicsVector2(0, 0);
            this.velocity = new PhysicsVector2(0, 0);
        }
    }


    /** Handy tuple for Cubism physics influence factors. */
    export class PhysicsFactorTuple {
        /**
         * Initializes instance.
         * 
         * @param x X-factor.
         * @param y Y-factor.
         * @param angle Angle factor.
         */
        public constructor(public x: number, public y: number, public angle: number) {}


        /**
         * Calculates sum.
         * 
         * @param factor Other factor.
         * 
         * @return Sum.
         */
        public add(factor: PhysicsFactorTuple): PhysicsFactorTuple {
            let x = this.x + factor.x;
            let y = this.y + factor.y;
            let angle = this.angle + factor.angle;


            return new PhysicsFactorTuple(x, y, angle);
        }
    }


    /** Handy tuple for Cubism physics normalization option parameters. */
    export class PhysicsNormalizationTuple {
        /**
         * Initializes instance.
         * 
         * @param minimum Lower limit.
         * @param maximum Upper limit.
         * @param def Default.
         */
        public constructor(public minimum: number, public maximum: number, public def: number) {}
    }


    /** Handly 2-component [[PhysicsNormalizationTuple]]. */
    export class PhysicsNormalizationOptions {
        /**
         * Initializes instance.
         * 
         * @param position Position normalization info.
         * @param angle Angle normalization info.
         */
        public constructor(public position: PhysicsNormalizationTuple, public angle: PhysicsNormalizationTuple) {}
    }


    /** Single Cubism physics input parameter. */
    export class PhysicsInput {
        /** Normalized weight. */
        public get normalizedWeight():number {
            return Physics.clampScalar(this.weight / Physics.maximumWeight, 0, 1);
        }


        /**
         * Initializes instance.
         * 
         * @param targetId Target parameter ID.
         * @param weight Weight.
         * @param factor Factor.
         * @param invert Controls inversion.
         */
        public constructor(public targetId: string, public weight: number, public factor: PhysicsFactorTuple, public invert: boolean) {}


        /**
         * Evaluates input factor.
         * 
         * @param parameterValue Current parameter value.
         * @param parameterMinimum Minimum parameter value.
         * @param parameterMaxium Maximum parameter value.
         * @param parameterDefault Default parameter value.
         * @param normalization Normalization constraint.
         * 
         * @return Input factor.
         */
        public evaluateFactor(parameterValue: number, parameterMinimum: number, parameterMaximum: number, parameterDefault: number, normalization: PhysicsNormalizationOptions): PhysicsFactorTuple {
            // HACK We only use 'angle' normalization here. Add 'position' normalization if deemed necessary.
            console.assert(parameterMaximum > parameterMinimum);

             // Calculate parameters middle value.
            let parameterMiddle = this.getMiddleValue(parameterMinimum, parameterMaximum);
            let value = parameterValue - parameterMiddle;

            // Math.sign(x) returns 1, -1, 0
            switch(Math.sign(value)){
                case 1:{
                    let parameterRange = parameterMaximum - parameterMiddle;
                    if (parameterRange == 0) {
                        value = normalization.angle.def;
                    }
                    else{
                        let normalizationRange = normalization.angle.maximum - normalization.angle.def;
                        if (normalizationRange == 0) {
                            value = normalization.angle.maximum;
                        }
                        else {
                            value *= Math.abs(normalizationRange / parameterRange);
                            value += normalization.angle.def;
                        }
                    }
                }
                break;
                
                case -1:{
                    let parameterRange = parameterMiddle - parameterMinimum;
                    if (parameterRange == 0) {
                        value = normalization.angle.def;
                    }
                    else {
                        let normalizationRange = normalization.angle.def - normalization.angle.minimum;
                        if (normalizationRange == 0) {
                            value = normalization.angle.minimum;
                        }
                        else {
                            value *= Math.abs(normalizationRange / parameterRange);
                            value += normalization.angle.def;
                        }
                    }
                }
                break;
                
                case 0:{
                    value = normalization.angle.def;
                }
                break;
            }

            // HACK Invert invert!
            let weight = (this.weight / Physics.maximumWeight);
            value *= (this.invert) ? 1 : -1;

            return new PhysicsFactorTuple(value * this.factor.x * weight, value * this.factor.y * weight, value * this.factor.angle * weight);
        }


        /**
         * Calculate range of values.
         */
        private getRangeValue(min: number, max: number): number {
            let maxValue = Math.max(min, max);
            let minValue = Math.min(min, max);
            return Math.abs(maxValue - minValue);
        }

        /**
         * Calculate middle value.
         */
        private getMiddleValue(min: number, max: number): number {
            let minValue = Math.min(min, max);
            return minValue + (this.getRangeValue(min, max) / 2);
        }

    }


    /** Single Cubism physics output parameter. */
    export class PhysicsOutput {
        /** Normalized weight. */
        public get normalizedWeight():number {
            return Physics.clampScalar(this.weight / Physics.maximumWeight, 0, 1);
        }


        /**
         * Initializes instance.
         * 
         * @param targetId Target parameter ID.
         * @param particleIndex Particle index.
         * @param weight Weight.
         * @param scale Scale.
         * @param factor Factor.
         * @param invert Controls inversion.
         */
        public constructor(public targetId: string, public particleIndex: number, public weight: number, angleScale: number, public factor: PhysicsFactorTuple, public invert: boolean) {
            this.factor.angle *= angleScale;
        }


        /**
         * Evaluates translation.
         * 
         * @param translation Translation.
         * @param particles Particles.
         * 
         * @return Evaluation result.
         */
        public evaluateValue(translation: PhysicsVector2, particles: Array<PhysicsParticle>): number {
            let value = (translation.x * this.factor.x) + (translation.y * this.factor.y);


            if (this.factor.angle > 0) {
                let parentGravity = Physics.gravity.multiplyByScalar(-1);
                

                if (Physics.correctAngles && this.particleIndex > 1) {
                    parentGravity = particles[this.particleIndex - 2].position
                        .substract(particles[this.particleIndex - 1].position);
                }


                translation.y *= -1;
                let angleResult = (Physics.directionToRadians(parentGravity.multiplyByScalar(-1), translation.multiplyByScalar(-1)));
                value += (((((-translation.multiplyByScalar(-1).x) - (-parentGravity.multiplyByScalar(-1).x)) > 0)
                    ? -angleResult
                    : angleResult) * this.factor.angle);
                translation.y *= -1;
            }


            value *= ((this.invert)
                ? -1
                : 1);


            return value;
        }
    }


    /** Cubism physics sub-rig. */
    export class PhysicsSubRig {
        /**
         * Initializes instance.
         * 
         * @param input Input.
         * @param output Output.
         * @param particles Particles.
         * @param normalization Normalization options.
         */
        public constructor(public input: Array<PhysicsInput>, public output: Array<PhysicsOutput>, public particles: Array<PhysicsParticle>, public normalization: PhysicsNormalizationOptions) {}


        /**
         * Updates simulation.
         * 
         * @param deltaTime Delta time.
         */
        public _update(deltaTime: number, target: LIVE2DCUBISMCORE.Model) {
            let parameters = target.parameters;


            // Calculate total input factor.
            let factor = new PhysicsFactorTuple(0, 0, 0);


            this.input.forEach((i) => {
                let parameterIndex = parameters.ids.indexOf(i.targetId);


                if (parameterIndex == -1) {
                    return;
                }


                factor = factor.add(i.evaluateFactor(parameters.values[parameterIndex], parameters.minimumValues[parameterIndex], parameters.maximumValues[parameterIndex], parameters.defaultValues[parameterIndex], this.normalization));
            });


            let a = Physics.degreesToRadians(-factor.angle);
            let xy = new PhysicsVector2(factor.x, factor.y).rotateByRadians(a);


            factor.x = xy.x
            factor.y = xy.y;


            // Update particles.
            let factorRadians = a;
            let gravityDirection = Physics
                .radiansToDirection(factorRadians)
                .normalize();


            this.particles.forEach((p, i) => {
                if (i == 0) {
                    p.position = new PhysicsVector2(factor.x, factor.y);


                    return;
                }


                p.force = gravityDirection.multiplyByScalar(p.acceleration).add(Physics.wind);
                p.lastPosition = p.position;


                // The Cubism Editor expects physics simulation to run at 30 FPS,
                // so we scale time here accordingly.
                let delay = p.delay * deltaTime * 30;
                

                let direction = p.position.substract(this.particles[i - 1].position);
                let distance = PhysicsVector2.distance(PhysicsVector2.zero, direction);
                let angle = Physics.directionToDegrees(p.lastGravity, gravityDirection);
                let radians = Physics.degreesToRadians(angle) / Physics.airResistance;

                direction = direction
                    .rotateByRadians(radians)
                    .normalize();
                

                p.position = this.particles[i - 1].position.add(direction.multiplyByScalar(distance));
                    
                
                let velocity = p.velocity.multiplyByScalar(delay);
                let force = p.force
                    .multiplyByScalar(delay)
                    .multiplyByScalar(delay);


                p.position = p.position
                    .add(velocity)
                    .add(force);


                let newDirection = p.position
                    .substract(this.particles[i - 1].position)
                    .normalize();


                p.position = this.particles[i - 1].position.add(newDirection.multiplyByScalar(p.radius));


                // FIXME: ??????
                if (Math.abs(p.position.x) < Physics.movementThreshold) {
                    p.position.x = p.lastPosition.x;
                }


                if (delay != 0) {
                    p.velocity = p.position
                        .substract(p.lastPosition)
                        .divideByScalar(delay)
                        .multiplyByScalar(p.mobility);
                } else {
                    p.velocity = PhysicsVector2.zero;
                }


                p.force = PhysicsVector2.zero;
                p.lastGravity = gravityDirection;
            });
        }

        /**
         * Applies simulation to [[target]].
         * 
         * @param target Target.
         */
        public _evaluate(target: LIVE2DCUBISMCORE.Model) {
            let parameters = target.parameters;


            // Evaluate output.
            this.output.forEach((o) => {
                console.assert(o.particleIndex > 0 && o.particleIndex < this.particles.length);


                let parameterIndex = parameters.ids.indexOf(o.targetId);


                if (parameterIndex == -1) {
                    return;
                }


                let translation = this.particles[o.particleIndex - 1].position.substract(this.particles[o.particleIndex].position);
                let value = Physics.clampScalar(o.evaluateValue(translation, this.particles), parameters.minimumValues[parameterIndex], parameters.maximumValues[parameterIndex]);
                let unclampedParameterValue = (parameters.values[parameterIndex] * (1 - o.normalizedWeight)) + (value * o.normalizedWeight);


                parameters.values[parameterIndex] = Physics.clampScalar(unclampedParameterValue, parameters.minimumValues[parameterIndex], parameters.maximumValues[parameterIndex]);
            });
        }
    }


    /** Cubism physics rig. */
    export class PhysicsRig {
        /** Simulation time scale. */
        public timeScale: number = 1;


        /** Updates simulationa and applies results. */
        public updateAndEvaluate(deltaTime: number): void {
            // Scale delta time.
            deltaTime *= ((this.timeScale > 0)
                ? this.timeScale
                : 0);


            // Tic layers.
            if (deltaTime > 0.01) {
                this._subRigs.forEach((r) => {
                    r._update(deltaTime, this._target);
                });
            }


            // Evaluate layers.
            this._subRigs.forEach((r) => {
                r._evaluate(this._target);
            });
        }


        /**
         * Creates physics rig.
         * 
         * @param physics3Json Physics descriptor.
         * 
         * @return Rig on success; [[null]] otherwise.
         */
        public static _fromPhysics3Json(target: LIVE2DCUBISMCORE.Model, timeScale: number, physics3Json: any) {
            let rig = new PhysicsRig(target, timeScale, physics3Json);


            return (rig._isValid)
                ? rig
                : null;
        }


        /** Target model. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** Sub rigs. */
        private _subRigs: Array<PhysicsSubRig>;

        /** [[true]] if instance is valid; [[false]] otherwise. */
        private get _isValid(): boolean {
            return this._target != null;
        }


        /**
         * Initializes instance.
         * 
         * @param physics3Json Physics descriptor.
         */
        private constructor(target: LIVE2DCUBISMCORE.Model, timeScale: number, physics3Json: any) {
            // Store arguments.
            this.timeScale = timeScale;
            this._target = target;


            if (!target) {
                return;
            }


            // Deserialize JSON.
            this._subRigs = new Array<PhysicsSubRig>();
            physics3Json['PhysicsSettings'].forEach((r: any) => {
                // Deserialize input.
                let input = new Array<PhysicsInput>()
                r['Input'].forEach((i: any) => {
                    let factor = new PhysicsFactorTuple(1, 0, 0);
                    if (i['Type'] == 'Y') {
                        factor.x = 0
                        factor.y = 1
                    } else if (i['Type'] == 'Angle') {
                        factor.x = 0
                        factor.angle = 1
                    }
                    input.push(new PhysicsInput(i['Source']['Id'], i['Weight'], factor, i['Reflect']));
                });


                // Deserialize output.
                let output = new Array<PhysicsOutput>();
                r['Output'].forEach((o: any) => {
                    let factor = new PhysicsFactorTuple(1, 0, 0);
                    if (o['Type'] == 'Y') {
                        factor.x = 0
                        factor.y = 1
                    } else if (o['Type'] == 'Angle') {
                        factor.x = 0
                        factor.angle = 1
                    }
                    output.push(new PhysicsOutput(o['Destination']['Id'], o['VertexIndex'], o['Weight'], o['Scale'], factor, o['Reflect']))
                });


                // Deserialize particles.
                let particles = new Array<PhysicsParticle>();
                r['Vertices'].forEach((p: any) => {
                    let initialPosition = new PhysicsVector2(p['Position']['X'], p['Position']['Y'])
                    particles.push(new PhysicsParticle(initialPosition, p['Mobility'], p['Delay'], p['Acceleration'], p['Radius']));
                });


                // Deserialize normalization.
                let jsonOptions = r['Normalization'];
                let positionsOption = new PhysicsNormalizationTuple(jsonOptions['Position']['Minimum'], jsonOptions['Position']['Maximum'], jsonOptions['Position']['Default']);
                let anglesOption = new PhysicsNormalizationTuple(jsonOptions['Angle']['Minimum'], jsonOptions['Angle']['Maximum'], jsonOptions['Angle']['Default']);
                let normalization = new PhysicsNormalizationOptions(positionsOption, anglesOption);


                // Create sub rig.
                this._subRigs.push(new PhysicsSubRig(input, output, particles, normalization));
            });            


            // TODO Validate state.
        }
    }


    /** Cubism [[PhysicsRig]] builder. */
    export class PhysicsRigBuilder {
        /**
         * Sets target model.
         *
         * @param value Target.
         * 
         * @return Builder.
         */
        public setTarget(value: LIVE2DCUBISMCORE.Model): PhysicsRigBuilder {
            this._target = value;


            return this;
        }

        /**
         * Sets time scale.
         *
         * @param value Time scale.
         * 
         * @return Builder.
         */
        public setTimeScale(value: number): PhysicsRigBuilder {
            this._timeScale = value;


            return this;
        }

        /**
         * Sets physics JSON to deserialize.
         * 
         * @param value Physics JSON object.
         * 
         * @return Builder.
         */
        public setPhysics3Json(value: any): PhysicsRigBuilder {
            this._physics3Json = value;


            return this;
        }


        /**
         * Executes build.
         * 
         * @return [[PhysicsRig]].
         */
        public build(): PhysicsRig {
            // TODO Validate state.


            return PhysicsRig._fromPhysics3Json(this._target, this._timeScale, this._physics3Json);
        }


        /** Target. */
        private _target: LIVE2DCUBISMCORE.Model;

        /** Time scale. */
        private _timeScale: number = 1;

        /** Physics JSON object. */
        private _physics3Json: any;
    }
}

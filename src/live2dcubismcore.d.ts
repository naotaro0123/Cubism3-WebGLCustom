declare namespace LIVE2DCUBISMCORE {
    /** Cubism moc. */
    class Moc {
        /** Creates [[Moc]] from [[ArrayBuffer]].
         *
         * @param buffer Array buffer
         *
         * @return [[Moc]] on success; [[null]] otherwise.
         */
        static fromArrayBuffer(buffer: ArrayBuffer): Moc;
        /** Releases instance. */
        _release(): void;
        /** Native moc. */
        _ptr: number;
        /**
         * Initializes instance.
         *
         * @param mocBytes Moc bytes.
         */
        private constructor();
    }
    /** Cubism model. */
    class Model {
        /** Parameters. */
        parameters: Parameters;
        /** Parts. */
        parts: Parts;
        /** Drawables. */
        drawables: Drawables;
        /**
         * Creates [[Model]] from [[Moc]].
         *
         * @param moc Moc
         *
         * @return [[Model]] on success; [[null]] otherwise.
         */
        static fromMoc(moc: Moc): Model;
        /** Updates instance. */
        update(): void;
        /** Releases instance. */
        release(): void;
        /** Native model. */
        _ptr: number;
        /**
         * Initializes instance.
         *
         * @param moc Moc
         */
        private constructor();
    }
    /** Cubism model parameters */
    class Parameters {
        /** Parameter count */
        count: number;
        /** Parameter IDs */
        ids: Array<string>;
        /** Minimum parameter values */
        minimumValues: Float32Array;
        /** Maximum parameter values */
        maximumValues: Float32Array;
        /** Default parameter values */
        defaultValues: Float32Array;
        /** Parameter values */
        values: Float32Array;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model.
         */
        constructor(modelPtr: number);
    }
    /** Cubism model parts */
    class Parts {
        /** Part count */
        count: number;
        /** Part IDs */
        ids: Array<string>;
        /** Opacity values */
        opacities: Float32Array;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model.
         */
        constructor(modelPtr: number);
    }
    /** Cubism model drawables */
    class Drawables {
        /** Drawable count */
        count: number;
        /** Drawable IDs */
        ids: Array<string>;
        /** Constant drawable flags. */
        constantFlags: Uint8Array;
        /** Dynamic drawable flags. */
        dynamicFlags: Uint8Array;
        /** Drawable texture indices. */
        textureIndices: Int32Array;
        /** Drawable draw orders. */
        drawOrders: Int32Array;
        /** Drawable render orders. */
        renderOrders: Int32Array;
        /** Drawable opacities. */
        opacities: Float32Array;
        /** Mask count for each drawable */
        maskCounts: Int32Array;
        /** Masks for each drawable */
        masks: Array<Int32Array>;
        /** Number of vertices of each drawable. */
        vertexCounts: Int32Array;
        /** Vertex position data of each drawable. */
        vertexPositions: Array<Float32Array>;
        /** Texture coordinate data of each drawables. */
        vertexUvs: Array<Float32Array>;
        /** Number of triangle indices for each drawable. */
        indexCounts: Int32Array;
        /** Triangle index data for each drawable. */
        indices: Array<Uint16Array>;
        /** Resets all dynamic drawable flags.. */
        resetDynamicFlags(): void;
        /** Native model. */
        private _modelPtr;
        /**
         * Initializes instance.
         *
         * @param modelPtr Native model.
         */
        constructor(modelPtr: number);
    }
    /** Utility functions. */
    class Utils {
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasBlendAdditiveBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasBlendMultiplicativeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasIsDoubleSidedBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasIsVisibleBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasVisibilityDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasOpacityDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasDrawOrderDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasRenderOrderDidChangeBit(bitfield: number): boolean;
        /**
         * Checks whether flag is set in bitfield.
         *
         * @param bitfield Bitfield to query against.
         *
         * @return [[true]] if bit set; [[false]] otherwise
        */
        static hasVertexPositionsDidChangeBit(bitfield: number): boolean;
    }
}

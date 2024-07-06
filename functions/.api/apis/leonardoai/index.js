"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var oas_1 = __importDefault(require("oas"));
var core_1 = __importDefault(require("api/dist/core"));
var openapi_json_1 = __importDefault(require("./openapi.json"));
var SDK = /** @class */ (function () {
    function SDK() {
        this.spec = oas_1.default.init(openapi_json_1.default);
        this.core = new core_1.default(this.spec, 'leonardoai/v1.0.0 (api/6.1.2)');
    }
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    SDK.prototype.config = function (config) {
        this.core.setConfig(config);
    };
    /**
     * If the API you're using requires authentication you can supply the required credentials
     * through this method and the library will magically determine how they should be used
     * within your API request.
     *
     * With the exception of OpenID and MutualTLS, it supports all forms of authentication
     * supported by the OpenAPI specification.
     *
     * @example <caption>HTTP Basic auth</caption>
     * sdk.auth('username', 'password');
     *
     * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
     * sdk.auth('myBearerToken');
     *
     * @example <caption>API Keys</caption>
     * sdk.auth('myApiKey');
     *
     * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
     * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
     * @param values Your auth credentials for the API; can specify up to two strings or numbers.
     */
    SDK.prototype.auth = function () {
        var _a;
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        (_a = this.core).setAuth.apply(_a, values);
        return this;
    };
    /**
     * If the API you're using offers alternate server URLs, and server variables, you can tell
     * the SDK which one to use with this method. To use it you can supply either one of the
     * server URLs that are contained within the OpenAPI definition (along with any server
     * variables), or you can pass it a fully qualified URL to use (that may or may not exist
     * within the OpenAPI definition).
     *
     * @example <caption>Server URL with server variables</caption>
     * sdk.server('https://{region}.api.example.com/{basePath}', {
     *   name: 'eu',
     *   basePath: 'v14',
     * });
     *
     * @example <caption>Fully qualified server URL</caption>
     * sdk.server('https://eu.api.example.com/v14');
     *
     * @param url Server URL
     * @param variables An object of variables to replace into the server URL.
     */
    SDK.prototype.server = function (url, variables) {
        if (variables === void 0) { variables = {}; }
        this.core.setServer(url, variables);
    };
    /**
     * This endpoint will return your user information such as your user id, username, token
     * renewal date and current amounts of the following: subscription tokens, gpt (prompt
     * generation) tokens, and model training tokens
     *
     * @summary Get user information
     */
    SDK.prototype.getUserSelf = function () {
        return this.core.fetch('/me', 'get');
    };
    /**
     * This endpoint will generate images
     *
     * @summary Create a Generation of Images
     */
    SDK.prototype.createGeneration = function (body) {
        return this.core.fetch('/generations', 'post', body);
    };
    /**
     * This endpoint will provide information about a specific generation
     *
     * @summary Get a Single Generation
     */
    SDK.prototype.getGenerationById = function (metadata) {
        return this.core.fetch('/generations/{id}', 'get', metadata);
    };
    /**
     * This endpoint deletes a specific generation
     *
     * @summary Delete a Single Generation
     */
    SDK.prototype.deleteGenerationById = function (metadata) {
        return this.core.fetch('/generations/{id}', 'delete', metadata);
    };
    /**
     * This endpoint returns all generations by a specific user
     *
     * @summary Get generations by user ID
     */
    SDK.prototype.getGenerationsByUserId = function (metadata) {
        return this.core.fetch('/generations/user/{userId}', 'get', metadata);
    };
    /**
     * This endpoint will generate a texture generation.
     *
     * @summary Create Texture Generation
     */
    SDK.prototype.createTextureGeneration = function (body) {
        return this.core.fetch('/generations-texture', 'post', body);
    };
    /**
     * This endpoint will generate a SVD motion generation.
     *
     * @summary Create SVD Motion Generation
     */
    SDK.prototype.createSVDMotionGeneration = function (body) {
        return this.core.fetch('/generations-motion-svd', 'post', body);
    };
    /**
     * This endpoint will generate a LCM image generation.
     *
     * @summary Create LCM Generation
     */
    SDK.prototype.createLCMGeneration = function (body) {
        return this.core.fetch('/generations-lcm', 'post', body);
    };
    /**
     * This endpoint will perform instant refine on a LCM image
     *
     * @summary Perform instant refine on a LCM image
     */
    SDK.prototype.performInstantRefine = function (body) {
        return this.core.fetch('/lcm-instant-refine', 'post', body);
    };
    /**
     * This endpoint will perform a inpainting on a LCM image
     *
     * @summary Perform inpainting on a LCM image
     */
    SDK.prototype.performInpaintingLCM = function (body) {
        return this.core.fetch('/lcm-inpainting', 'post', body);
    };
    /**
     * This endpoint will perform Alchemy Upscale on a LCM image
     *
     * @summary Perform Alchemy Upscale on a LCM image
     */
    SDK.prototype.performAlchemyUpscaleLCM = function (body) {
        return this.core.fetch('/lcm-upscale', 'post', body);
    };
    SDK.prototype.getTextureGenerationsByModelId = function (body, metadata) {
        return this.core.fetch('/generations-texture/model/{modelId}', 'get', body, metadata);
    };
    SDK.prototype.getTextureGenerationById = function (body, metadata) {
        return this.core.fetch('/generations-texture/{id}', 'get', body, metadata);
    };
    SDK.prototype.deleteTextureGenerationById = function (body, metadata) {
        return this.core.fetch('/generations-texture/{id}', 'delete', body, metadata);
    };
    /**
     * This endpoint returns presigned details to upload a 3D model to S3
     *
     * @summary Upload 3D Model
     */
    SDK.prototype.uploadModelAsset = function (body) {
        return this.core.fetch('/models-3d/upload', 'post', body);
    };
    SDK.prototype.get3DModelsByUserId = function (body, metadata) {
        return this.core.fetch('/models-3d/user/{userId}', 'get', body, metadata);
    };
    SDK.prototype.get3DModelById = function (body, metadata) {
        return this.core.fetch('/models-3d/{id}', 'get', body, metadata);
    };
    SDK.prototype.delete3DModelById = function (body, metadata) {
        return this.core.fetch('/models-3d/{id}', 'delete', body, metadata);
    };
    /**
     * This endpoint returns presigned details to upload an init image to S3
     *
     * @summary Upload init image
     */
    SDK.prototype.uploadInitImage = function (body) {
        return this.core.fetch('/init-image', 'post', body);
    };
    /**
     * This endpoint will return a single init image
     *
     * @summary Get single init image
     */
    SDK.prototype.getInitImageById = function (metadata) {
        return this.core.fetch('/init-image/{id}', 'get', metadata);
    };
    /**
     * This endpoint deletes an init image
     *
     * @summary Delete init image
     */
    SDK.prototype.deleteInitImageById = function (metadata) {
        return this.core.fetch('/init-image/{id}', 'delete', metadata);
    };
    /**
     * This endpoint returns presigned details to upload an init image and a mask image to S3
     *
     * @summary Upload Canvas Editor init and mask image
     */
    SDK.prototype.uploadCanvasInitImage = function (body) {
        return this.core.fetch('/canvas-init-image', 'post', body);
    };
    /**
     * This endpoint will create an unzoom variation for the provided image ID
     *
     * @summary Create unzoom
     */
    SDK.prototype.createVariationUnzoom = function (body) {
        return this.core.fetch('/variations/unzoom', 'post', body);
    };
    /**
     * This endpoint will create an upscale for the provided image ID
     *
     * @summary Create upscale
     */
    SDK.prototype.createVariationUpscale = function (body) {
        return this.core.fetch('/variations/upscale', 'post', body);
    };
    /**
     * This endpoint will create a no background variation of the provided image ID
     *
     * @summary Create no background
     */
    SDK.prototype.createVariationNoBG = function (body) {
        return this.core.fetch('/variations/nobg', 'post', body);
    };
    /**
     * This endpoint will create a high resolution image using Universal Upscaler
     *
     * @summary Create using Universal Upscaler
     */
    SDK.prototype.createUniversalUpscalerJob = function (body) {
        return this.core.fetch('/variations/universal-upscaler', 'post', body);
    };
    /**
     * This endpoint will get the variation by ID
     *
     * @summary Get variation by ID
     */
    SDK.prototype.getVariationById = function (metadata) {
        return this.core.fetch('/variations/{id}', 'get', metadata);
    };
    /**
     * This endpoint creates a new dataset
     *
     * @summary Create a Dataset
     */
    SDK.prototype.createDataset = function (body) {
        return this.core.fetch('/datasets', 'post', body);
    };
    /**
     * This endpoint gets the specific dataset
     *
     * @summary Get a Single Dataset by ID
     */
    SDK.prototype.getDatasetById = function (metadata) {
        return this.core.fetch('/datasets/{id}', 'get', metadata);
    };
    /**
     * This endpoint deletes the specific dataset
     *
     * @summary Delete a Single Dataset by ID
     */
    SDK.prototype.deleteDatasetById = function (metadata) {
        return this.core.fetch('/datasets/{id}', 'delete', metadata);
    };
    /**
     * This endpoint returns presigned details to upload a dataset image to S3
     *
     * @summary Upload dataset image
     */
    SDK.prototype.uploadDatasetImage = function (body, metadata) {
        return this.core.fetch('/datasets/{datasetId}/upload', 'post', body, metadata);
    };
    /**
     * This endpoint will upload a previously generated image to the dataset
     *
     * @summary Upload a Single Generated Image to a Dataset
     */
    SDK.prototype.uploadDatasetImageFromGen = function (body, metadata) {
        return this.core.fetch('/datasets/{datasetId}/upload/gen', 'post', body, metadata);
    };
    /**
     * This endpoint will train a new custom model
     *
     * @summary Train a Custom Model
     */
    SDK.prototype.createModel = function (body) {
        return this.core.fetch('/models', 'post', body);
    };
    /**
     * This endpoint gets the specific custom model
     *
     * @summary Get a Single Custom Model by ID
     */
    SDK.prototype.getModelById = function (metadata) {
        return this.core.fetch('/models/{id}', 'get', metadata);
    };
    /**
     * This endpoint will delete a specific custom model
     *
     * @summary Delete a Single Custom Model by ID
     */
    SDK.prototype.deleteModelById = function (metadata) {
        return this.core.fetch('/models/{id}', 'delete', metadata);
    };
    /**
     * Get a list of public Platform Models available for use with generations.
     *
     * @summary List Platform Models
     */
    SDK.prototype.listPlatformModels = function () {
        return this.core.fetch('/platformModels', 'get');
    };
    /**
     * Get a list of public Elements available for use with generations.
     *
     * @summary List Elements
     */
    SDK.prototype.listElements = function () {
        return this.core.fetch('/elements', 'get');
    };
    /**
     * This endpoint returns a random prompt
     *
     * @summary Generate a Random prompt
     */
    SDK.prototype.promptRandom = function () {
        return this.core.fetch('/prompt/random', 'post');
    };
    /**
     * This endpoint returns a improved prompt
     *
     * @summary Improve a Prompt
     */
    SDK.prototype.promptImprove = function (body) {
        return this.core.fetch('/prompt/improve', 'post', body);
    };
    /**
     * This endpoint returns the cost used for generating images using a particular service
     * type.
     *
     * @summary Calculating API Cost
     */
    SDK.prototype.pricingCalculator = function (body) {
        return this.core.fetch('/pricing-calculator', 'post', body);
    };
    return SDK;
}());
var createSDK = (function () { return new SDK(); })();
module.exports = createSDK;

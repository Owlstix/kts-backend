import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core';
import Oas from 'oas';
import APICore from 'api/dist/core';
declare class SDK {
    spec: Oas;
    core: APICore;
    constructor();
    /**
     * Optionally configure various options that the SDK allows.
     *
     * @param config Object of supported SDK options and toggles.
     * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
     * should be represented in milliseconds.
     */
    config(config: ConfigOptions): void;
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
    auth(...values: string[] | number[]): this;
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
    server(url: string, variables?: {}): void;
    /**
     * This endpoint will return your user information such as your user id, username, token
     * renewal date and current amounts of the following: subscription tokens, gpt (prompt
     * generation) tokens, and model training tokens
     *
     * @summary Get user information
     */
    getUserSelf(): Promise<FetchResponse<200, types.GetUserSelfResponse200>>;
    /**
     * This endpoint will generate images
     *
     * @summary Create a Generation of Images
     */
    createGeneration(body: types.CreateGenerationBodyParam): Promise<FetchResponse<200, types.CreateGenerationResponse200>>;
    /**
     * This endpoint will provide information about a specific generation
     *
     * @summary Get a Single Generation
     */
    getGenerationById(metadata: types.GetGenerationByIdMetadataParam): Promise<FetchResponse<200, types.GetGenerationByIdResponse200>>;
    /**
     * This endpoint deletes a specific generation
     *
     * @summary Delete a Single Generation
     */
    deleteGenerationById(metadata: types.DeleteGenerationByIdMetadataParam): Promise<FetchResponse<200, types.DeleteGenerationByIdResponse200>>;
    /**
     * This endpoint returns all generations by a specific user
     *
     * @summary Get generations by user ID
     */
    getGenerationsByUserId(metadata: types.GetGenerationsByUserIdMetadataParam): Promise<FetchResponse<200, types.GetGenerationsByUserIdResponse200>>;
    /**
     * This endpoint will generate a texture generation.
     *
     * @summary Create Texture Generation
     */
    createTextureGeneration(body?: types.CreateTextureGenerationBodyParam): Promise<FetchResponse<200, types.CreateTextureGenerationResponse200>>;
    /**
     * This endpoint will generate a SVD motion generation.
     *
     * @summary Create SVD Motion Generation
     */
    createSVDMotionGeneration(body: types.CreateSvdMotionGenerationBodyParam): Promise<FetchResponse<200, types.CreateSvdMotionGenerationResponse200>>;
    /**
     * This endpoint will generate a LCM image generation.
     *
     * @summary Create LCM Generation
     */
    createLCMGeneration(body: types.CreateLcmGenerationBodyParam): Promise<FetchResponse<200, types.CreateLcmGenerationResponse200>>;
    /**
     * This endpoint will perform instant refine on a LCM image
     *
     * @summary Perform instant refine on a LCM image
     */
    performInstantRefine(body: types.PerformInstantRefineBodyParam): Promise<FetchResponse<200, types.PerformInstantRefineResponse200>>;
    /**
     * This endpoint will perform a inpainting on a LCM image
     *
     * @summary Perform inpainting on a LCM image
     */
    performInpaintingLCM(body: types.PerformInpaintingLcmBodyParam): Promise<FetchResponse<200, types.PerformInpaintingLcmResponse200>>;
    /**
     * This endpoint will perform Alchemy Upscale on a LCM image
     *
     * @summary Perform Alchemy Upscale on a LCM image
     */
    performAlchemyUpscaleLCM(body: types.PerformAlchemyUpscaleLcmBodyParam): Promise<FetchResponse<200, types.PerformAlchemyUpscaleLcmResponse200>>;
    /**
     * This endpoint gets the specific texture generations by the 3d model id.
     *
     * @summary Get texture generations by 3D Model ID
     */
    getTextureGenerationsByModelId(body: types.GetTextureGenerationsByModelIdBodyParam, metadata: types.GetTextureGenerationsByModelIdMetadataParam): Promise<FetchResponse<200, types.GetTextureGenerationsByModelIdResponse200>>;
    getTextureGenerationsByModelId(metadata: types.GetTextureGenerationsByModelIdMetadataParam): Promise<FetchResponse<200, types.GetTextureGenerationsByModelIdResponse200>>;
    /**
     * This endpoint gets the specific texture generation.
     *
     * @summary Get Texture Generation by ID
     */
    getTextureGenerationById(body: types.GetTextureGenerationByIdBodyParam, metadata: types.GetTextureGenerationByIdMetadataParam): Promise<FetchResponse<200, types.GetTextureGenerationByIdResponse200>>;
    getTextureGenerationById(metadata: types.GetTextureGenerationByIdMetadataParam): Promise<FetchResponse<200, types.GetTextureGenerationByIdResponse200>>;
    /**
     * This endpoint deletes the specific texture generation.
     *
     * @summary Delete Texture Generation by ID
     */
    deleteTextureGenerationById(body: types.DeleteTextureGenerationByIdBodyParam, metadata: types.DeleteTextureGenerationByIdMetadataParam): Promise<FetchResponse<200, types.DeleteTextureGenerationByIdResponse200>>;
    deleteTextureGenerationById(metadata: types.DeleteTextureGenerationByIdMetadataParam): Promise<FetchResponse<200, types.DeleteTextureGenerationByIdResponse200>>;
    /**
     * This endpoint returns presigned details to upload a 3D model to S3
     *
     * @summary Upload 3D Model
     */
    uploadModelAsset(body?: types.UploadModelAssetBodyParam): Promise<FetchResponse<200, types.UploadModelAssetResponse200>>;
    /**
     * This endpoint returns all 3D models by a specific user
     *
     * @summary Get 3D models by user ID
     */
    get3DModelsByUserId(body: types.Get3DModelsByUserIdBodyParam, metadata: types.Get3DModelsByUserIdMetadataParam): Promise<FetchResponse<200, types.Get3DModelsByUserIdResponse200>>;
    get3DModelsByUserId(metadata: types.Get3DModelsByUserIdMetadataParam): Promise<FetchResponse<200, types.Get3DModelsByUserIdResponse200>>;
    /**
     * This endpoint gets the specific 3D model
     *
     * @summary Get 3D Model by ID
     */
    get3DModelById(body: types.Get3DModelByIdBodyParam, metadata: types.Get3DModelByIdMetadataParam): Promise<FetchResponse<200, types.Get3DModelByIdResponse200>>;
    get3DModelById(metadata: types.Get3DModelByIdMetadataParam): Promise<FetchResponse<200, types.Get3DModelByIdResponse200>>;
    /**
     * This endpoint deletes the specific 3D Model
     *
     * @summary Delete 3D Model by ID
     */
    delete3DModelById(body: types.Delete3DModelByIdBodyParam, metadata: types.Delete3DModelByIdMetadataParam): Promise<FetchResponse<200, types.Delete3DModelByIdResponse200>>;
    delete3DModelById(metadata: types.Delete3DModelByIdMetadataParam): Promise<FetchResponse<200, types.Delete3DModelByIdResponse200>>;
    /**
     * This endpoint returns presigned details to upload an init image to S3
     *
     * @summary Upload init image
     */
    uploadInitImage(body: types.UploadInitImageBodyParam): Promise<FetchResponse<200, types.UploadInitImageResponse200>>;
    /**
     * This endpoint will return a single init image
     *
     * @summary Get single init image
     */
    getInitImageById(metadata: types.GetInitImageByIdMetadataParam): Promise<FetchResponse<200, types.GetInitImageByIdResponse200>>;
    /**
     * This endpoint deletes an init image
     *
     * @summary Delete init image
     */
    deleteInitImageById(metadata: types.DeleteInitImageByIdMetadataParam): Promise<FetchResponse<200, types.DeleteInitImageByIdResponse200>>;
    /**
     * This endpoint returns presigned details to upload an init image and a mask image to S3
     *
     * @summary Upload Canvas Editor init and mask image
     */
    uploadCanvasInitImage(body: types.UploadCanvasInitImageBodyParam): Promise<FetchResponse<200, types.UploadCanvasInitImageResponse200>>;
    /**
     * This endpoint will create an unzoom variation for the provided image ID
     *
     * @summary Create unzoom
     */
    createVariationUnzoom(body?: types.CreateVariationUnzoomBodyParam): Promise<FetchResponse<200, types.CreateVariationUnzoomResponse200>>;
    /**
     * This endpoint will create an upscale for the provided image ID
     *
     * @summary Create upscale
     */
    createVariationUpscale(body: types.CreateVariationUpscaleBodyParam): Promise<FetchResponse<200, types.CreateVariationUpscaleResponse200>>;
    /**
     * This endpoint will create a no background variation of the provided image ID
     *
     * @summary Create no background
     */
    createVariationNoBG(body: types.CreateVariationNoBgBodyParam): Promise<FetchResponse<200, types.CreateVariationNoBgResponse200>>;
    /**
     * This endpoint will create a high resolution image using Universal Upscaler
     *
     * @summary Create using Universal Upscaler
     */
    createUniversalUpscalerJob(body: types.CreateUniversalUpscalerJobBodyParam): Promise<FetchResponse<200, types.CreateUniversalUpscalerJobResponse200>>;
    /**
     * This endpoint will get the variation by ID
     *
     * @summary Get variation by ID
     */
    getVariationById(metadata: types.GetVariationByIdMetadataParam): Promise<FetchResponse<200, types.GetVariationByIdResponse200>>;
    /**
     * This endpoint creates a new dataset
     *
     * @summary Create a Dataset
     */
    createDataset(body: types.CreateDatasetBodyParam): Promise<FetchResponse<200, types.CreateDatasetResponse200>>;
    /**
     * This endpoint gets the specific dataset
     *
     * @summary Get a Single Dataset by ID
     */
    getDatasetById(metadata: types.GetDatasetByIdMetadataParam): Promise<FetchResponse<200, types.GetDatasetByIdResponse200>>;
    /**
     * This endpoint deletes the specific dataset
     *
     * @summary Delete a Single Dataset by ID
     */
    deleteDatasetById(metadata: types.DeleteDatasetByIdMetadataParam): Promise<FetchResponse<200, types.DeleteDatasetByIdResponse200>>;
    /**
     * This endpoint returns presigned details to upload a dataset image to S3
     *
     * @summary Upload dataset image
     */
    uploadDatasetImage(body: types.UploadDatasetImageBodyParam, metadata: types.UploadDatasetImageMetadataParam): Promise<FetchResponse<200, types.UploadDatasetImageResponse200>>;
    /**
     * This endpoint will upload a previously generated image to the dataset
     *
     * @summary Upload a Single Generated Image to a Dataset
     */
    uploadDatasetImageFromGen(body: types.UploadDatasetImageFromGenBodyParam, metadata: types.UploadDatasetImageFromGenMetadataParam): Promise<FetchResponse<200, types.UploadDatasetImageFromGenResponse200>>;
    /**
     * This endpoint will train a new custom model
     *
     * @summary Train a Custom Model
     */
    createModel(body: types.CreateModelBodyParam): Promise<FetchResponse<200, types.CreateModelResponse200>>;
    /**
     * This endpoint gets the specific custom model
     *
     * @summary Get a Single Custom Model by ID
     */
    getModelById(metadata: types.GetModelByIdMetadataParam): Promise<FetchResponse<200, types.GetModelByIdResponse200>>;
    /**
     * This endpoint will delete a specific custom model
     *
     * @summary Delete a Single Custom Model by ID
     */
    deleteModelById(metadata: types.DeleteModelByIdMetadataParam): Promise<FetchResponse<200, types.DeleteModelByIdResponse200>>;
    /**
     * Get a list of public Platform Models available for use with generations.
     *
     * @summary List Platform Models
     */
    listPlatformModels(): Promise<FetchResponse<200, types.ListPlatformModelsResponse200>>;
    /**
     * Get a list of public Elements available for use with generations.
     *
     * @summary List Elements
     */
    listElements(): Promise<FetchResponse<200, types.ListElementsResponse200>>;
    /**
     * This endpoint returns a random prompt
     *
     * @summary Generate a Random prompt
     */
    promptRandom(): Promise<FetchResponse<200, types.PromptRandomResponse200>>;
    /**
     * This endpoint returns a improved prompt
     *
     * @summary Improve a Prompt
     */
    promptImprove(body: types.PromptImproveBodyParam): Promise<FetchResponse<200, types.PromptImproveResponse200>>;
    /**
     * This endpoint returns the cost used for generating images using a particular service
     * type.
     *
     * @summary Calculating API Cost
     */
    pricingCalculator(body?: types.PricingCalculatorBodyParam): Promise<FetchResponse<200, types.PricingCalculatorResponse200>>;
}
declare const createSDK: SDK;
export = createSDK;

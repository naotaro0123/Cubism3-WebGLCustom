# Cubism SDK For Native Development

Welcome to the open components of the *Cubism SDK for JavaScript*. The **the open components are work-in-progress**.
They're not yet feature-complete and their API isn't fixed yet.
While the SDK is meant for *JavaScript*, it's written in *TypeScript*.

If you're interested in why we're releasing the SDK as early access, read on.

If you came here looking for the official *Live2D* homepage, go [here](http://www.live2d.com/products/cubism3).


## Why Early Access?

With the *Cubism 3 SDK*s we strive to provide the SDKs you need.
We shared the *Unity* SDK from the prototype stage with multiple developers and made sure to reflect their feedback.

For the *JavaScript* SDK we take things one step further by opening the evaluation phase up for everyone,
so it would be great if you could give the SDK a try and provide any feedback through this *GitHub* project.


## Modules

### *LIVE2DCUBISMFRAMEWORK*

This module contains functionality for playing back and blending animations as well as convenience functions for the Cubism Core.
It's located in `./src/live2dcubismframework.ts`.


### *LIVE2DCUBISMPIXI*

This module contains functionality for loading and rendering *Cubism* models with the phantastic *Pixi* library.
It's located in `./src/live2dcubismpixi.ts`.


## Getting Started

No manual is available yet. The best places to start are the example(`./example/src/**/*.*`) and
the completely documented module source files.

To use the modules, you need to link against the *Cubism Core* library.
*We're currently evaluating to distribute Core and modules through npm once they're out of early-access*,
but in the meantime, either link against the [non-permanent official library online](http://live2d.github.io/#js) or
[build the library yourself](https://github.com/Live2D/CubismBindings).


## Contributing

There are many ways to contribute to the project: logging bugs, submitting pull requests, reporting issues, and creating suggestions.

While any form of contributing is greatly appreciated, *suggestions regarding design and API are especially important to us*.


## Discussion Etiquette

Please limit the discussion to English and keep it professional and things on topic.


## Todo

### *LIVE2DCUBISMPIXI*

- Implement clipping.
- Implement culling?


## License

The license applying to the source code in this project allows you modify all sources without the need to submit any changes you made.
Whenever releasing a product using source code from this project, you just have to make sure that you link your product with the *Cubism Core*.
Refer to [this license](http://live2d.com/eula/live2d-open-software-license-agreement_en.html) for the gritty details.

# Introduction

This is intended to reproduce an issue we have encountered on Sequelize v6 since the introduction of https://github.com/sequelize/sequelize/pull/15818 when using CLS with Sequelize.

This change copied the transaction onto the options object during load/update/etc operations and that reference seems to be retained through the \_options object on the returned model (but only on included relations, not the model itself!).

The code in index.js will, every one second, create a new cls context and run a transaction within it. In this transaction a model will be loaded with a relation included. The promise to load the model and the model, once loaded, will both be stored on the cls context. If you take a heapsnapshot you will see that one instance of the model per execution of the transaction will be retained.

In our code we are, indirectly, storing a promise for the loaded model on the sequelize transaction, and then, once loaded, we store a reference to the model itself on cls. We, therefore, indirectly store a reference to a promise on cls and the cls state associated with this promise can now never be destroyed.

Here is a diagram of the references:

```mermaid
graph TD
    CLS --> |unreferenced after transaction| transaction
    CLS --> model
    model --> transaction
    transaction --> P["promise< model >"]
    P --> model
```

Here is a screenshot showing how the loaded model references the transaction through the include property on _options:

<img width="733" alt="Screenshot 2023-06-16 at 16 23 33" src="https://github.com/chriswheeldon-peakon/sequelize-transaction-ref-issue/assets/73166588/bf36cdfa-a485-482d-8ed2-812d007ebc29">

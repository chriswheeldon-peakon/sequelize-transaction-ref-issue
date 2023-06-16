# Introduction

This is intended to reproduce an issue we have encountered on Sequelize v6 since the introduction of https://github.com/sequelize/sequelize/pull/15818.

This change copied the transaction onto the options object during load/update/etc operations and that reference seems to be retained through the \_options object on the returned model (but only on included relations, not the model itself!).

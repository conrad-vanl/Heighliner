// import { merge } from "lodash";
import { defaultCache } from "../../../util/cache";
import { createGlobalId } from "../../../util";

import {
  BinaryFile as BinaryFileTable,
  // Location as LocationTable, // XXX move to its own model
} from "./tables";

import { Rock } from "../system/model";

export class BinaryFile extends Rock {
   __type = "BinaryFile";

  constructor({ cache } = { cache: defaultCache }) {
    super({ cache });
    this.cache = cache;
  }

  processFile(file) {
    // is relative path to Rock
    if (file.Path[0] === "~") {
      file.Path = file.Path.substr(2);
      file.Path = this.baseUrl + file.Path;
    }

    // remove query string variables
    if (file.Path && file.Path.indexOf("?") > -1) {
      file.Path = file.Path.substr(0, file.Path.indexOf("?"));
    }

    return file;
  }

  async getFromId(id, globalId) {
    globalId = globalId ? globalId : createGlobalId(`${id}`, this.__type);
    return this.cache.get(globalId, () => BinaryFileTable.findOne({ where: { Id: id }})
      .then(this.processFile)
    );
  }

  async getFromGuid(Guid) {
    return this.cache.get(`${Guid}:BinaryFileGuid`, () => BinaryFileTable.findOne({
      where: { Guid },
    })
      .then(this.processFile)
    );
  }

  // async getFromPerson
  async find(query) {
    return this.cache.get(this.cache.encode(query), () => BinaryFileTable.find({
      where: query,
      attributes: ["Id"],
    })
      .then(this.getFromIds.bind(this))
    );

  }


}

export default {
  BinaryFile,
};

export default [
  "people(email: String): [Person]",
  "person(guid: ID): Person",
  "currentPerson(cache: Boolean = true): Person",
  "currentFamily: [GroupMember]",
];

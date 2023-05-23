Clak parses csv values to return internationalized messages in a "lazy" manner, mostly for server applications sending language-specific responses. An innovative base/default-values setup solutuion from [nanostores][2] with [@nanostores/i18n][3] is loosely followed.

 * operates on csv values,
 * enforces in-code default langugage values ala nanostores,
 * anticipates predictable, [unity-style csv file format,][1]
 * provides a flat key-value interface using no namespaces,
 * less than 100 lines of code and no dependencies,
 * returns lazy values easily used with 'accept-language' request headers


[1]: https://docs.unity3d.com/Packages/com.unity.localization@1.2/manual/CSV.html
[2]: https://github.com/nanostores/nanostores
[3]: https://github.com/nanostores/i18n

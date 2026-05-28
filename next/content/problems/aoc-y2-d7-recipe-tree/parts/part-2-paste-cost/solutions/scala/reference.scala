object Solution {
  private case class Ingredient(amount: Int, name: String)
  private val Recipe = raw"(\w+) requires (.+)\.".r
  private val IngredientRule = raw"(\d+) (\w+)".r

  def binding_paste_cost(inputText: String): Int = {
    val children = parseRecipes(inputText)
    if (!children.contains("final_product")) return 0

    val memo = scala.collection.mutable.Map.empty[String, Int]
    def cost(name: String): Int =
      if (name == "binding_paste") 1
      else memo.getOrElseUpdate(name, children.getOrElse(name, Vector.empty).map { ingredient =>
        ingredient.amount * cost(ingredient.name)
      }.sum)

    cost("final_product")
  }

  private def parseRecipes(inputText: String): Map[String, Vector[Ingredient]] =
    inputText.linesIterator.map(_.trim).filter(_.nonEmpty).flatMap {
      case Recipe(name, "nothing") => Some(name -> Vector.empty[Ingredient])
      case Recipe(name, ingredientsText) =>
        val ingredients = IngredientRule.findAllMatchIn(ingredientsText).map { m =>
          Ingredient(m.group(1).toInt, m.group(2))
        }.toVector
        Some(name -> ingredients)
      case _ => None
    }.toMap
}

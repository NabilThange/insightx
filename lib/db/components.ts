import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

export const ComponentService = {
    /**
     * Search data source templates (Master Catalog)
     */
    async searchTemplates(query: string) {
        const { data, error } = await supabase
            .from('component_templates')
            .select('*')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
            .limit(10)

        if (error) throw error
        return data
    },

    /**
     * Get exact schema for a data source by name (Used by SQL Agent)
     */
    async getSchema(name: string) {
        const { data, error } = await supabase
            .from('component_templates')
            .select('pins, voltage_range, interface_types')
            .eq('name', name)
            .single()

        if (error) return null
        return data
    },

    /**
     * Add a data source instance to a project (Data DNA)
     */
    async addPartToProject(part: Database['public']['Tables']['parts']['Insert']) {
        const { data, error } = await supabase
            .from('parts')
            .insert(part)
            .select()
            .single()

        if (error) throw error
        return data
    }
}

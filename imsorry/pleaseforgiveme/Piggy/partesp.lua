-- Create GUI
local screenGui = Instance.new("ScreenGui", game.Players.LocalPlayer:WaitForChild("PlayerGui"))
screenGui.ResetOnSpawn = false

local toggleButton = Instance.new("TextButton", screenGui)
toggleButton.Size = UDim2.new(0, 120, 0, 30)
toggleButton.Position = UDim2.new(0, 10, 0.5, -15)
toggleButton.Text = "Toggle ESP"
toggleButton.BackgroundColor3 = Color3.new(0.2, 0.2, 0.2)
toggleButton.TextColor3 = Color3.new(1, 1, 1)
toggleButton.Active = true
toggleButton.Draggable = true

local runService = game:GetService("RunService")
local enabled = true

-- Utility: Strip digits and hyphens
local function isTargetFolder(name)
	local stripped = name:gsub("%d", ""):gsub("%-", "")
	return stripped == ""
end

-- Create Highlight and Billboard
local function applyESP(part)
	if not part:IsA("BasePart") then return end

	-- Highlight
	if not part:FindFirstChildOfClass("Highlight") then
		local h = Instance.new("Highlight")
		h.FillColor = Color3.new(1, 0, 0)
		h.OutlineColor = Color3.new(1, 1, 1)
		h.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
		h.Parent = part
	end

	-- BillboardGui
	if not part:FindFirstChild("NameTag") then
		local billboard = Instance.new("BillboardGui")
		billboard.Name = "NameTag"
		billboard.Size = UDim2.new(0, 100, 0, 30)
		billboard.StudsOffset = Vector3.new(0, 2, 0)
		billboard.AlwaysOnTop = true
		billboard.Adornee = part
		billboard.Parent = part

		local label = Instance.new("TextLabel")
		label.Size = UDim2.new(1, 0, 1, 0)
		label.BackgroundTransparency = 1
		label.TextColor3 = Color3.new(1, 1, 1)
		label.TextStrokeTransparency = 0
		label.TextScaled = true
		label.Text = part.Name
		label.Font = Enum.Font.ArialBold
		label.Parent = billboard
	end
end

-- Main ESP loop
runService.RenderStepped:Connect(function()
	if not enabled then return end

	for _, folder in ipairs(workspace:GetChildren()) do
		if folder:IsA("Folder") and isTargetFolder(folder.Name) then
			for _, obj in ipairs(folder:GetChildren()) do
				applyESP(obj)
			end
		end
	end
end)

-- Toggle ESP
toggleButton.MouseButton1Click:Connect(function()
	enabled = not enabled
	toggleButton.Text = enabled and "ESP: ON" or "ESP: OFF"

	if not enabled then
		-- Remove Highlights and Billboards
		for _, folder in ipairs(workspace:GetChildren()) do
			if folder:IsA("Folder") and isTargetFolder(folder.Name) then
				for _, obj in ipairs(folder:GetChildren()) do
					if obj:IsA("BasePart") then
						local h = obj:FindFirstChildOfClass("Highlight")
						if h then h:Destroy() end

						local b = obj:FindFirstChild("NameTag")
						if b then b:Destroy() end
					end
				end
			end
		end
	end
end)